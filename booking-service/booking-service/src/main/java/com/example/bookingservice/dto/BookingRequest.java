package com.example.bookingservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    @NotNull(message = "Please provide a valid roomId")
    private Long roomId;

    @NotNull(message = "Please provide a valid startTime")
    private OffsetDateTime startTime;

    @NotNull(message = "Please provide a valid endTime")
    private OffsetDateTime endTime;

    private String createdBy;

    @NotBlank(message = "Please provide a valid title")
    private String title;

    private String description;

    // optional resource requests
    private List<ResourceRequest> resources;
}
