package com.example.bookingservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDto {
    private Long id;

    @NotBlank(message = "Please provide a valid name")
    private String name;

    private String location;

    @NotNull(message = "Please provide a valid capacity")
    private Integer capacity;

    // comma separated equipment list
    private String equipment;

    private Boolean active;

    private Boolean requiresApproval;

    private Boolean maintenance;

    private OffsetDateTime maintenanceStart;
    private OffsetDateTime maintenanceEnd;
    private String maintenanceReason;
}
