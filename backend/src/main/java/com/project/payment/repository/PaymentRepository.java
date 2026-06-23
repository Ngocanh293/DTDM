package com.project.payment.repository;

import com.project.payment.entity.Payment;
import com.project.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Tìm kiếm thanh toán theo mã đơn hàng (Mặc định lọc is_deleted = false)
    Optional<Payment> findByOrderId(Long orderId);

    // Lấy danh sách theo trạng thái
    List<Payment> findByStatus(PaymentStatus status);

    // Tìm kiếm thanh toán bất kể trạng thái xóa
    @Query(value = "SELECT * FROM payments WHERE id = :id", nativeQuery = true)
    Optional<Payment> findByIdIncludingDeleted(@Param("id") Long id);
}
