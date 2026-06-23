package com.project.inventory.service;

import com.project.inventory.entity.Inventory;
import com.project.inventory.repository.InventoryRepository;
import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Dịch vụ xuất báo cáo tồn kho ra file Excel.
 */
@Service
public class InventoryExportService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    @Value("${inventory.low-stock-threshold:10}")
    private int lowStockThreshold;

    public InventoryExportService(InventoryRepository inventoryRepository,
                                  ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }

    /**
     * Tạo file Excel báo cáo tồn kho toàn bộ sản phẩm.
     */
    public byte[] exportInventoryToExcel() throws IOException {
        List<Inventory> inventories = inventoryRepository.findAll();
        
        // Lấy danh sách Product ID để query thông tin sản phẩm (tên, brand) hàng loạt -> tránh N+1
        List<Long> productIds = inventories.stream()
                .map(Inventory::getProductId)
                .collect(Collectors.toList());
        
        Map<Long, Product> productMap = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Inventory Report");

            // --- Thiết lập Header ---
            String[] headers = {"STT", "Mã SP", "Tên Sản Phẩm", "Thương Hiệu", "Tổng Tồn", "Đang Giữ", "Khả Dụng", "Trạng Thái"};
            Row headerRow = sheet.createRow(0);
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // --- Điền dữ liệu ---
            int rowIdx = 1;
            for (Inventory inv : inventories) {
                Row row = sheet.createRow(rowIdx++);
                Product product = productMap.get(inv.getProductId());
                int available = inv.getQuantity() - inv.getReserved();

                row.createCell(0).setCellValue(rowIdx - 1);
                row.createCell(1).setCellValue(inv.getProductId());
                row.createCell(2).setCellValue(product != null ? product.getName() : "Unknown");
                row.createCell(3).setCellValue(product != null ? product.getBrand() : "N/A");
                row.createCell(4).setCellValue(inv.getQuantity());
                row.createCell(5).setCellValue(inv.getReserved());
                row.createCell(6).setCellValue(available);

                Cell statusCell = row.createCell(7);
                if (available <= 0) {
                    statusCell.setCellValue("HẾT HÀNG");
                } else if (available < lowStockThreshold) {
                    statusCell.setCellValue("SẮP HẾT");
                } else {
                    statusCell.setCellValue("CÒN HÀNG");
                }
            }

            // Tự động căn chỉnh độ rộng cột
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
