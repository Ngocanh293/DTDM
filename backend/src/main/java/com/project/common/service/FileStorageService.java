package com.project.common.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private final Path avatarStorageLocation;

    public FileStorageService(@Value("${custom.storage.avatars:uploads/avatars}") String avatarDir) {
        this.avatarStorageLocation = Paths.get(avatarDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.avatarStorageLocation);
            logger.info("Avatar storage directory initialized at: {}", this.avatarStorageLocation);
        } catch (IOException ex) {
            throw new IllegalStateException("Không thể tạo thư mục lưu trữ ảnh đại diện.", ex);
        }
    }

    public String storeAvatar(MultipartFile file) {
        // Chuẩn hóa tên file
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = "";

        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            extension = originalFileName.substring(i);
        }

        // Kiểm tra định dạng (Chỉ cho phép ảnh)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ được phép tải lên tệp tin hình ảnh.");
        }

        // Tạo tên file duy nhất để tránh ghi đè
        String fileName = UUID.randomUUID().toString() + extension;

        try {
            // Kiểm tra tệp tin có hợp lệ không
            if (fileName.contains("..")) {
                throw new IllegalArgumentException("Tên tệp tin không hợp lệ: " + fileName);
            }

            // Sao chép tệp tin vào thư mục mục tiêu
            Path targetLocation = this.avatarStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new IllegalStateException("Không thể lưu trữ tệp tin " + fileName + ". Vui lòng thử lại!", ex);
        }
    }

    public void deleteAvatar(String fileName) {
        try {
            Path filePath = this.avatarStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            logger.error("Không thể xóa ảnh đại diện cũ: {} - Lỗi: {}", fileName, ex.getMessage());
        }
    }
}
