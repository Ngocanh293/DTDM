package com.project.product.service;

import com.project.product.dto.CategoryRequest;
import com.project.product.dto.CategoryResponse;

import java.util.List;

/**
 * Service interface quản lý nghiệp vụ Category.
 */
public interface CategoryService {

    List<CategoryResponse> getAllCategories();

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);
}
