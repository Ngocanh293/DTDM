package com.project.product.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO nhận dữ liệu tạo/cập nhật Category từ client.
 */
public class CategoryRequest {

    @NotBlank(message = "{validation.category.name.empty}")
    private String name;

    public CategoryRequest() {
    }

    public CategoryRequest(String name) {
        this.name = name;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
