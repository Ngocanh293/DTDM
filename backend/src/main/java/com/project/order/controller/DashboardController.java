package com.project.order.controller;

import com.project.order.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<Map<String, Object>>> getRecentOrders() {
        return ResponseEntity.ok(dashboardService.getRecentOrders().stream()
                .map(order -> {
                    // Cần tạo hàm mapping chung hoặc gọi qua orderController nếu public
                    // Ở đây ta có thể copy logic mapping đơn giản
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", order.getId());
                    map.put("customerName", order.getUser() != null ? order.getUser().getFullName() : "Khách vãng lai");
                    map.put("totalAmount", order.getTotalAmount());
                    map.put("status", order.getStatus());
                    map.put("date", order.getOrderDate());
                    return map;
                })
                .collect(Collectors.toList()));
    }
}
