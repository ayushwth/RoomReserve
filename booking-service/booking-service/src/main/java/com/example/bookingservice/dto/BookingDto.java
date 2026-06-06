package com.example.bookingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Long id;
    private Long roomId;
    private String roomName;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String title;
    private String description;
    private String createdBy;
    private String status;
    private String rejectionReason;
    private String cancellationReason;
    private java.util.List<ResourceLine> resources;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceLine {
        private Long resourceId;
        private String name;
        private String type;
        private Integer quantity;
    }
}
