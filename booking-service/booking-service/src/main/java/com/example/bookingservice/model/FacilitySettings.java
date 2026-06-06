package com.example.bookingservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.time.OffsetDateTime;

@Entity
@Table(name = "facility_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacilitySettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // default opening and closing times (local time)
    private LocalTime openTime = LocalTime.of(8,0);
    private LocalTime closeTime = LocalTime.of(18,0);

    // optional maintenance blackout window for facility
    private OffsetDateTime maintenanceStart;
    private OffsetDateTime maintenanceEnd;
    private String maintenanceReason;
}
