package com.example.bookingservice.service;

import com.example.bookingservice.model.AuditLog;
import com.example.bookingservice.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class AuditLogService {
    private final AuditLogRepository repo;

    public AuditLogService(AuditLogRepository repo) { this.repo = repo; }

    public AuditLog log(String action, String username, String details) {
        AuditLog a = new AuditLog();
        a.setAction(action);
        a.setUsername(username);
        a.setDetails(details);
        a.setTimestamp(OffsetDateTime.now());
        return repo.save(a);
    }

    public java.util.List<AuditLog> findAll() {
        return repo.findAll();
    }
}
