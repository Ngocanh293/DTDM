package com.project.product.service;

import com.project.common.exception.ResourceNotFoundException;
import com.project.product.dto.CategoryRequest;
import com.project.product.dto.CategoryResponse;
import com.project.product.entity.Category;
import com.project.product.repository.CategoryRepository;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Triển khai nghiệp vụ Category: CRUD, validation tên trùng lặp.
 */
@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final MessageSource messageSource;

    public CategoryServiceImpl(CategoryRepository categoryRepository, MessageSource messageSource) {
        this.categoryRepository = categoryRepository;
        this.messageSource = messageSource;
    }

    private String msg(String key, Object... args) {
        return messageSource.getMessage(key, args, LocaleContextHolder.getLocale());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String trimmedName = request.getName().trim();
        if (categoryRepository.existsByName(trimmedName)) {
            throw new IllegalArgumentException(msg("error.category.name_duplicate", trimmedName));
        }
        Category category = new Category();
        category.setName(trimmedName);
        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(msg("error.category.not_found", id)));

        String trimmedName = request.getName().trim();
        // Cho phép giữ tên cũ, chỉ chặn trùng với category KHÁC
        boolean nameUsedByOther = categoryRepository.findByName(trimmedName)
            .filter(other -> !other.getId().equals(id))
            .isPresent();
        if (nameUsedByOther) {
            throw new IllegalArgumentException(msg("error.category.name_duplicate", trimmedName));
        }

        category.setName(trimmedName);
        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(msg("error.category.not_found", id)));
        category.setDeleted(true);
        categoryRepository.save(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getCreatedAt(),
            category.getUpdatedAt()
        );
    }
}
