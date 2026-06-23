package com.project.notification.entity;

import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "email_templates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"type", "locale"})
})
public class EmailTemplate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, length = 10)
    private String locale; // "vi", "en"

    @Column(nullable = false)
    private String subject;

    /**
     * HTML content with placeholders like {{link}}
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    public EmailTemplate() {}

    public EmailTemplate(NotificationType type, String locale, String subject, String content) {
        this.type = type;
        this.locale = locale;
        this.subject = subject;
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
