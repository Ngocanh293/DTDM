package com.project.inventory.controller;

import com.project.inventory.dto.InventoryHistoryResponse;
import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.dto.InventoryResponse;
import com.project.inventory.service.InventoryExportService;
import com.project.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * Controller quản lý luồng dữ liệu tồn kho (Giai đoạn 3).
 */
@RestController
@RequestMapping("/api/v1/inventory")
@Tag(name = "Inventory", description = "Quản lý tồn kho sản phẩm")
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryExportService exportService;

    public InventoryController(InventoryService inventoryService, InventoryExportService exportService) {
        this.inventoryService = inventoryService;
        this.exportService = exportService;
    }

    @Operation(summary = "Lấy thông tin tồn kho", description = "Truy xuất số lượng thực tế và số lượng có sẵn (trong Cache).")
    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getStock(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getStock(productId));
    }

    @Operation(summary = "Xuất báo cáo tồn kho Excel", description = "Xuất file Excel danh sách kho của toàn bộ sản phẩm. Chỉ dành cho ADMIN.")
    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportInventory() {
        try {
            byte[] excelContent = exportService.exportInventoryToExcel();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "inventory_report.xlsx");
            
            return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Cập nhật số lượng tồn kho", description = "ADMIN cập nhật số lượng hàng vật lý.")
    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryResponse> updateStock(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(request));
    }

    @Operation(summary = "Trừ tồn kho", description = "Endpoint nội bộ dùng cho Order flow.")
    @PostMapping("/decrease")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryResponse> decreaseStock(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.decreaseStock(request));
    }

    @Operation(summary = "Hoàn lại tồn kho", description = "Hoàn lại hàng khi đơn hàng bị hủy.")
    @PostMapping("/increase")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryResponse> increaseStock(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.increaseStock(request));
    }

    @Operation(summary = "Giữ hàng tạm thời", description = "Giữ hàng khi khách Checkout. Tự động set TTL 15p.")
    @PostMapping("/reserve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryResponse> reserveStock(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.reserveStock(request));
    }

    @Operation(summary = "Giữ hàng hàng loạt", description = "Dùng cho giỏ hàng có nhiều sản phẩm.")
    @PostMapping("/reserve-bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<InventoryResponse>> reserveStockBulk(@Valid @RequestBody List<InventoryRequest> requests) {
        return ResponseEntity.ok(inventoryService.reserveStockBulk(requests));
    }

    @Operation(summary = "Xác nhận trừ kho", description = "Chốt hàng sau khi thanh toán thành công.")
    @PostMapping("/confirm")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryResponse> confirmStock(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.confirmStock(request));
    }

    @Operation(summary = "Xác nhận kho hàng loạt", description = "Xác nhận trừ kho cho đơn hàng.")
    @PostMapping("/confirm-bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<InventoryResponse>> confirmStockBulk(@Valid @RequestBody List<InventoryRequest> requests) {
        return ResponseEntity.ok(inventoryService.confirmStockBulk(requests));
    }

    @Operation(summary = "Huỷ giữ hàng", description = "Huỷ giữ khi thanh toán thất bại.")
    @PostMapping("/cancel-reservation")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryResponse> cancelReservation(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.cancelReservation(request));
    }

    @Operation(summary = "Huỷ giữ hàng hàng loạt", description = "Huỷ giữ kho cho nhiều sản phẩm.")
    @PostMapping("/cancel-reservation-bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<InventoryResponse>> cancelReservationBulk(@Valid @RequestBody List<InventoryRequest> requests) {
        return ResponseEntity.ok(inventoryService.cancelReservationBulk(requests));
    }

    @Operation(summary = "Xem lịch sử biến động kho", description = "Truy xuất danh sách audit trail.")
    @GetMapping("/history/{productId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Page<InventoryHistoryResponse>> getHistory(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(inventoryService.getHistory(productId, PageRequest.of(page, size)));
    }
}
