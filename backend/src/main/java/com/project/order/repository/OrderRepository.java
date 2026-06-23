package com.project.order.repository;

import com.project.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Tìm kiếm các đơn hàng của user (Mặc định lọc is_deleted = false)
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product WHERE o.userId = :userId AND o.isDeleted = false")
    List<Order> findByUserId(@Param("userId") Long userId);

    // Tìm kiếm đơn hàng cụ thể kèm theo items (Tránh LazyInitializationException)
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product LEFT JOIN FETCH o.user WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    // Tìm kiếm đơn hàng bất kể trạng thái xóa (Dùng cho Admin)
    @Query(value = "SELECT * FROM orders WHERE id = :id", nativeQuery = true)
    Optional<Order> findByIdIncludingDeleted(@Param("id") Long id);

    // Lấy toàn bộ đơn hàng kèm thông tin User và Shipping (Tối ưu cho Admin Dashboard)
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.user LEFT JOIN FETCH o.shipping")
    List<Order> findAllWithDetails();
}
