package com.example.bookingservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @NotNull
    private OffsetDateTime startTime;

    @NotNull
    private OffsetDateTime endTime;

    private String title;

    @Column(length = 2000)
    private String description;

    private String createdBy;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private String rejectionReason;

    private String cancellationReason;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<com.example.bookingservice.model.ResourceReservation> resourceReservations = new java.util.ArrayList<>();

    public java.util.List<com.example.bookingservice.model.ResourceReservation> getResourceReservations() { return resourceReservations; }
    public void setResourceReservations(java.util.List<com.example.bookingservice.model.ResourceReservation> resourceReservations) { this.resourceReservations = resourceReservations; }
}
