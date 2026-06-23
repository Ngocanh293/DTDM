package com.project.product.service;

import com.project.product.dto.ProductRequest;
import com.project.product.dto.ProductResponse;
import com.project.product.entity.Category;
import com.project.product.entity.Product;
import com.project.product.repository.CategoryRepository;
import com.project.product.repository.ProductRepository;
import com.project.common.exception.ResourceNotFoundException;
import com.project.product.event.ProductCreatedEvent;
import com.project.inventory.service.InventoryService;
import com.project.inventory.entity.Inventory;
import com.project.inventory.repository.InventoryRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import com.project.inventory.repository.InventoryRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MessageSource messageSource;
    private final ApplicationEventPublisher eventPublisher;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              MessageSource messageSource,
                              ApplicationEventPublisher eventPublisher,
                              InventoryRepository inventoryRepository,
                              InventoryService inventoryService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.messageSource = messageSource;
        this.eventPublisher = eventPublisher;
        this.inventoryRepository = inventoryRepository;
        this.inventoryService = inventoryService;
    }

    private String getMessage(String key, Object... args) {
        return messageSource.getMessage(key, args, LocaleContextHolder.getLocale());
    }

    /**
     * Lấy danh sách tất cả sản phẩm (hỗ trợ phân trang & sorting).
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return mapPageToResponse(productRepository.findAll(pageable));
    }

    /**
     * Tìm kiếm sản phẩm theo từ khoá (tên, thương hiệu & tên danh mục), không phân biệt hoa thường.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        return mapPageToResponse(productRepository.findByKeyword(keyword, pageable));
    }

    /**
     * Lọc danh sách sản phẩm theo ID danh mục.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        return mapPageToResponse(productRepository.findByCategoryId(categoryId, pageable));
    }

    /**
     * Lọc danh sách sản phẩm theo khoảng giá.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return mapPageToResponse(productRepository.findByPriceBetween(minPrice, maxPrice, pageable));
    }

    /**
     * Filter kết hợp linh hoạt: keyword + category + khoảng giá cùng lúc.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> filterProducts(String keyword, Long categoryId,
                                                BigDecimal minPrice, BigDecimal maxPrice,
                                                Pageable pageable) {
        if (keyword == null) {
            keyword = "";
        }
        return mapPageToResponse(productRepository.filterProducts(keyword, categoryId, minPrice, maxPrice, pageable));
    }

    /**
     * Lấy thông tin chi tiết một sản phẩm dựa trên ID.
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(getMessage("error.product.not_found", id)));
        Integer stock = inventoryService.getStock(product.getId()).getQuantity();
        return mapToResponse(product, stock);
    }

    /**
     * Tạo mới một sản phẩm. Publish event để Inventory khởi tạo bản ghi tương ứng.
     */
    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        getMessage("error.category.not_found", request.getCategoryId())));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .brand(request.getBrand())
                .imageUrl(request.getImageUrl())
                .build();

        Product savedProduct = productRepository.save(product);

        Integer initialStock = request.getStock() != null ? request.getStock() : 0;
        eventPublisher.publishEvent(new ProductCreatedEvent(savedProduct.getId(), initialStock));

        return mapToResponse(savedProduct, initialStock);
    }

    /**
     * Cập nhật thông tin của một sản phẩm đã có sẵn.
     */
    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(getMessage("error.product.not_found", id)));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        getMessage("error.category.not_found", request.getCategoryId())));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setImageUrl(request.getImageUrl());

        Product updatedProduct = productRepository.save(product);
        Integer currentStock = inventoryService.getStock(updatedProduct.getId()).getQuantity();
        return mapToResponse(updatedProduct, currentStock);
    }

    /**
     * Xóa mềm sản phẩm và cascade soft-delete inventory liên quan.
     */
    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(getMessage("error.product.not_found", id)));
        product.setDeleted(true);
        productRepository.save(product);

        // Cascade soft-delete: inventory của sản phẩm bị xóa mềm theo
        inventoryRepository.findByProductId(id).ifPresent(inv -> {
            inv.setDeleted(true);
            inventoryRepository.save(inv);
        });
    }

    /**
     * Khôi phục sản phẩm đã xóa mềm và restore inventory đi kèm.
     */
    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public void restoreProduct(Long id) {
        Product product = productRepository.findByIdIncludingDeleted(id)
                .orElseThrow(() -> new ResourceNotFoundException(getMessage("error.product.not_found", id)));
        product.setDeleted(false);
        productRepository.save(product);

        // Cascade restore: khôi phục inventory cùng với sản phẩm
        inventoryRepository.findByProductIdIncludingDeleted(id).ifPresent(inv -> {
            inv.setDeleted(false);
            inventoryRepository.save(inv);
        });
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Batch-map một Page<Product> sang Page<ProductResponse>.
     * Chỉ thực hiện MỘT query batch tới Inventory thay vì N queries riêng lẻ.
     */
    private Page<ProductResponse> mapPageToResponse(Page<Product> page) {
        if (page.isEmpty()) return page.map(p -> mapToResponse(p, 0));

        List<Long> productIds = page.getContent().stream()
                .map(Product::getId)
                .toList();

        Map<Long, Integer> stockMap = inventoryService.getStockBulk(productIds);

        return page.map(product -> mapToResponse(product, stockMap.getOrDefault(product.getId(), 0)));
    }

    /**
     * Chuyển đổi Product Entity + stock thành ProductResponse DTO.
     */
    private ProductResponse mapToResponse(Product product, Integer stock) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(stock)
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .brand(product.getBrand())
                .imageUrl(product.getImageUrl())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
