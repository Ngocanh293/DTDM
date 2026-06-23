package com.project.shipping.repository;

import com.project.shipping.entity.Shipping;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ShippingRepository extends JpaRepository<Shipping, Long> {
    Optional<Shipping> findByOrderId(Long orderId);
}
