package com.project.shipping.service;

import com.project.order.entity.Order;
import com.project.shipping.entity.Shipping;
import com.project.shipping.entity.ShippingStatus;

import java.math.BigDecimal;
import java.util.Optional;

public interface ShippingService {
    BigDecimal calculateShippingCost(String address);
    Shipping createShippingForOrder(Order order, String deliveryAddress);
    Shipping trackShipping(Long orderId);
    Shipping updateShippingStatus(Long shippingId, ShippingStatus newStatus);
    Optional<Shipping> getShippingByOrderId(Long orderId);
}
