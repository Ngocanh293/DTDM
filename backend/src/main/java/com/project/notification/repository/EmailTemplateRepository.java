package com.project.notification.repository;

import com.project.notification.entity.EmailTemplate;
import com.project.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    Optional<EmailTemplate> findByTypeAndLocale(NotificationType type, String locale);
}
