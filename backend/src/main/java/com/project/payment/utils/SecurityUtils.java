package com.project.payment.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;

public class SecurityUtils {

    // THỨ TỰ TRƯỜNG BẮT BUỘC THEO TÀI LIỆU CHÍNH THỨC SEPAY TERMINAL 2024
    private static final List<String> SIGNED_FIELDS = Arrays.asList(
            "order_amount",
            "merchant",
            "currency",
            "operation",
            "order_description",
            "order_invoice_number",
            "customer_id",
            "payment_method",
            "success_url",
            "error_url",
            "cancel_url"
    );

    private SecurityUtils() {
        throw new IllegalStateException("Utility class");
    }

    public static String generateSePaySignature(Map<String, String> fields, String secretKey) {
        try {
            List<String> signedParts = new ArrayList<>();
            // BẮT BUỘC duyệt theo danh sách chuẩn này để lấy đúng thứ tự
            for (String field : SIGNED_FIELDS) {
                String value = fields.get(field);
                // Nếu trường trống, SePay thường mong đợi key= (không có giá trị)
                signedParts.add(field + "=" + (value != null ? value : ""));
            }

            // JOIN bằng dấu phẩy (,) - Chuẩn SePay Terminal
            String data = String.join(",", signedParts);

            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKeySpec);

            byte[] hmacBytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Error generating SePay HMAC-SHA256 signature", e);
        }
    }
}
