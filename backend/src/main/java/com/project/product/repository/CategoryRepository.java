package com.project.product.repository;

import com.project.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Tìm kiếm danh mục bất kể trạng thái xóa
    @Query(value = "SELECT * FROM categories WHERE id = :id", nativeQuery = true)
    Optional<Category> findByIdIncludingDeleted(@Param("id") Long id);

    boolean existsByName(String name);

    Optional<Category> findByName(String name);
}
