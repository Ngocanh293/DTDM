package com.project.shipping.dto;

import com.project.shipping.entity.Shipping;
import com.project.shipping.entity.ShippingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO tách biệt cấu trúc API khỏi Entity database.
 * Tránh lộ thông tin nội bộ (quan hệ Order) ra ngoài API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingResponseDTO {

    private Long id;
    private Long orderId;
    private String deliveryAddress;
    private BigDecimal shippingCost;
    private ShippingStatus status;
    private String trackingCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ShippingResponseDTO from(Shipping shipping) {
        return ShippingResponseDTO.builder()
                .id(shipping.getId())
                .orderId(shipping.getOrder() != null ? shipping.getOrder().getId() : null)
                .deliveryAddress(shipping.getDeliveryAddress())
                .shippingCost(shipping.getShippingCost())
                .status(shipping.getStatus())
                .trackingCode(shipping.getTrackingCode())
                .createdAt(shipping.getCreatedAt())
                .updatedAt(shipping.getUpdatedAt())
                .build();
    }
}
