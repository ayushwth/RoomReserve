package com.example.bookingservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String location;

    private Integer capacity;
    
    // comma-separated equipment list (e.g., "PROJECTOR,VC")
    private String equipment;

    private Boolean active = true;

    private Boolean requiresApproval = false;

    // quick maintenance flag - if true, room cannot be booked
    private Boolean maintenance = false;

    // optional maintenance window
    private java.time.OffsetDateTime maintenanceStart;
    private java.time.OffsetDateTime maintenanceEnd;
    private String maintenanceReason;
}
