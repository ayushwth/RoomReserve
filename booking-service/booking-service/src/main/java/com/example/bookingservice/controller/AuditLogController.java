package com.example.bookingservice.controller;

import com.example.bookingservice.model.AuditLog;
import com.example.bookingservice.service.AuditLogService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin
public class AuditLogController {
    private final AuditLogService service;

    public AuditLogController(AuditLogService service) {
        this.service = service;
    }

    @GetMapping
    public List<AuditLog> list(@RequestParam(required = false) String from,
                               @RequestParam(required = false) String to,
                               @RequestParam(required = false) String booking,
                               @RequestParam(required = false) String room) {
        OffsetDateTime fromDate = from != null && !from.isBlank() ? OffsetDateTime.parse(from) : null;
        OffsetDateTime toDate = to != null && !to.isBlank() ? OffsetDateTime.parse(to) : null;
        String bookingNeedle = booking != null && !booking.isBlank() ? "bookingId=" + booking : null;
        String roomNeedle = room != null && !room.isBlank() ? "roomId=" + room : null;

        return service.findAll().stream()
                .filter(log -> fromDate == null || !log.getTimestamp().isBefore(fromDate))
                .filter(log -> toDate == null || !log.getTimestamp().isAfter(toDate))
                .filter(log -> bookingNeedle == null || (log.getDetails() != null && log.getDetails().contains(bookingNeedle)))
                .filter(log -> roomNeedle == null || (log.getDetails() != null && log.getDetails().contains(roomNeedle)))
                .sorted(Comparator.comparing(AuditLog::getTimestamp).reversed())
                .toList();
    }
}
