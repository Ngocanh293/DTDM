package com.project.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();

        // Mỗi cache được cấu hình riêng biệt để tối ưu thời gian sống
        cacheManager.registerCustomCache("jwtBlacklist",
                Caffeine.newBuilder()
                        .expireAfterWrite(1, TimeUnit.DAYS)
                        .maximumSize(10000)
                        .build());

        cacheManager.registerCustomCache("emailTemplates",
                Caffeine.newBuilder()
                        .expireAfterWrite(1, TimeUnit.HOURS)
                        .maximumSize(100)
                        .build());

        cacheManager.registerCustomCache("login_buckets",
                Caffeine.newBuilder()
                        .expireAfterWrite(15, TimeUnit.MINUTES)
                        .maximumSize(5000)
                        .build());

        // Cache tokenVersion: TTL ngắn (5 phút) — cân bằng giữa hiệu năng và bảo mật
        cacheManager.registerCustomCache("tokenVersion",
                Caffeine.newBuilder()
                        .expireAfterWrite(5, TimeUnit.MINUTES)
                        .maximumSize(10000)
                        .build());

        // Cache rate limiting per IP: 1 phút mỗi bucket
        cacheManager.registerCustomCache("rateLimitBuckets",
                Caffeine.newBuilder()
                        .expireAfterWrite(1, TimeUnit.MINUTES)
                        .maximumSize(20000)
                        .build());

        // Cache thông tin tồn kho: 10 phút - cân bằng giữa hiệu năng và tính thời gian thực
        cacheManager.registerCustomCache("inventory",
                Caffeine.newBuilder()
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .maximumSize(5000)
                        .build());

        // Cache cho API xem chi tiết Product - giải quyết triệt để nút thắt cổ chai
        cacheManager.registerCustomCache("products",
                Caffeine.newBuilder()
                        .expireAfterWrite(15, TimeUnit.MINUTES)
                        .maximumSize(10000)
                        .build());

        return cacheManager;
    }
}
