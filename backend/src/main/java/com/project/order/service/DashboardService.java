package com.project.order.service;

import com.project.auth.repository.UserRepository;
import com.project.order.entity.Order;
import com.project.order.entity.OrderStatus;
import com.project.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getStats() {
        List<Order> orders = orderRepository.findAll();
        
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long totalOrders = orders.size();
        long totalCustomers = userRepository.count();
        BigDecimal totalProfit = totalRevenue.multiply(new BigDecimal("0.2")); // Giả định lợi nhuận 20%

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalOrders", totalOrders);
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalProfit", totalProfit);
        stats.put("totalPurchases", totalRevenue.multiply(new BigDecimal("0.8"))); // Giả định chi phí nhập hàng 80%
        stats.put("totalExpenses", totalRevenue.multiply(new BigDecimal("0.05"))); // Chi phí vận hành 5%
        
        return stats;
    }

    public List<Order> getRecentOrders() {
        // Lấy 5 đơn hàng gần đây nhất
        return orderRepository.findAll().stream()
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .limit(5)
                .toList();
    }
}
