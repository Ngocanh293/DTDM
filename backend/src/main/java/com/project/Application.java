package com.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableScheduling
@EnableCaching
@EnableRetry
@EnableAsync
public class Application {

    // Điểm bắt đầu (Main entry) của ứng dụng Spring Boot
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
