package com.project.common.util;

import com.project.inventory.entity.Inventory;
import com.project.inventory.repository.InventoryRepository;
import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

/**
 * Thành phần tự động seed dữ liệu tồn kho cho các sản phẩm chưa có Inventory Record.
 * Chạy ngay sau khi ứng dụng khởi động thành công.
 */
@Component
@Order(2)
public class TestDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(TestDataSeeder.class);

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final com.project.product.repository.CategoryRepository categoryRepository;
    private final Random random = new Random();

    public TestDataSeeder(ProductRepository productRepository, 
                          InventoryRepository inventoryRepository,
                          com.project.product.repository.CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Đang kiểm tra và Seed Dữ liệu mẫu...");

        // 0. Khởi tạo danh mục nếu cơ sở dữ liệu trống tinh
        if (categoryRepository.count() == 0) {
            log.info("Không tìm thấy Danh mục nào. Đang tạo danh mục mẫu: Laptop Gaming...");
            com.project.product.entity.Category category = com.project.product.entity.Category.builder()
                    .name("Laptop Gaming")
                    .build();
            categoryRepository.save(category);
            log.info("Đã tạo thành công danh mục mẫu với ID: {}", category.getId());
        }

        log.info("Đang bắt đầu quá trình Seed Dữ liệu Tồn kho (Inventory Seed)...");

        // 1. Lấy tất cả sản phẩm hiện có (Bao gồm cả dữ liệu từ data.sql)
        List<Product> products = productRepository.findAll();
        int seededCount = 0;

        for (Product product : products) {
            // 2. Kiểm tra xem sản phẩm đã có bản ghi tồn kho chưa
            if (!inventoryRepository.existsByProductId(product.getId())) {
                log.info("Phát hiện sản phẩm [ID: {}, Tên: {}] chưa có kho. Đang khởi tạo...", 
                         product.getId(), product.getName());

                // 3. Tạo bản ghi Inventory mới với số lượng ngẫu nhiên 10-50
                int randomQuantity = 10 + random.nextInt(41);
                
                Inventory inventory = Inventory.builder()
                        .productId(product.getId())
                        .quantity(randomQuantity)
                        .reserved(0)
                        .build();

                inventoryRepository.save(inventory);
                seededCount++;
            }
        }

        if (seededCount > 0) {
            log.info("Hoàn tất Seed Dữ liệu. Đã tạo mới {} bản ghi Inventory.", seededCount);
        } else {
            log.info("Không có sản phẩm mới nào cần Seed kho. Dữ liệu đã đầy đủ.");
        }
    }
}
