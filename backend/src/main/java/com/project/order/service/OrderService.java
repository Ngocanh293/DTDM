package com.project.order.service;

import com.project.order.dto.OrderRequestDTO;
import com.project.order.entity.Order;
import com.project.order.entity.OrderStatus;

import java.util.List;

public interface OrderService {
    Order createOrder(OrderRequestDTO requestDTO);
    Order getOrderById(Long id);
    List<Order> getAllOrders();
    List<Order> getOrderHistory(Long userId);
    Order updateOrderStatus(Long orderId, OrderStatus status);
    void cancelOrder(Long orderId);
    void deleteOrder(Long orderId);
    void restoreOrder(Long orderId);
    void deleteAllOrders(Long userId);
    Order getOrderByGuest(Long orderId, String phone);
}
