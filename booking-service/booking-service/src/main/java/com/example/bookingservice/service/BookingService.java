package com.example.bookingservice.service;

import com.example.bookingservice.model.Booking;
import com.example.bookingservice.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final FacilitySettingsService facilitySettingsService;
    private final com.example.bookingservice.repository.ResourceReservationRepository resourceReservationRepository;

    public BookingService(BookingRepository bookingRepository, FacilitySettingsService facilitySettingsService, com.example.bookingservice.repository.ResourceReservationRepository resourceReservationRepository) {
        this.bookingRepository = bookingRepository;
        this.facilitySettingsService = facilitySettingsService;
        this.resourceReservationRepository = resourceReservationRepository;
    }

    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }

    public java.util.Optional<Booking> findById(Long id) {
        return bookingRepository.findById(id);
    }

    public java.util.List<Booking> findByStatus(com.example.bookingservice.model.BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    public java.util.List<Booking> findByCreatedBy(String createdBy) {
        return bookingRepository.findByCreatedBy(createdBy);
    }

    public Booking save(Booking booking) {
        validate(booking);
        return bookingRepository.save(booking);
    }

    public Booking cancel(Booking booking, String reason) {
        booking.setStatus(com.example.bookingservice.model.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        return bookingRepository.save(booking);
    }

    private void validate(Booking booking) {
        if (booking.getStartTime() != null && booking.getEndTime() != null && !booking.getStartTime().isBefore(booking.getEndTime())) {
            throw new com.example.bookingservice.exception.ConflictException("Start time must be before end time");
        }

        // conflict detection: check existing APPROVED bookings that overlap
        if (booking.getRoom() != null && booking.getStartTime() != null && booking.getEndTime() != null) {
            Long roomId = booking.getRoom().getId();

            if (!Boolean.TRUE.equals(booking.getRoom().getActive())) {
                throw new com.example.bookingservice.exception.ConflictException("Room is inactive and cannot be booked");
            }

            // If room is under maintenance flag, reject
            if (Boolean.TRUE.equals(booking.getRoom().getMaintenance())) {
                throw new com.example.bookingservice.exception.ConflictException("Room is under maintenance");
            }

            // If maintenance window overlaps requested slot, reject
            if (booking.getRoom().getMaintenanceStart() != null && booking.getRoom().getMaintenanceEnd() != null) {
                if (!(booking.getEndTime().isBefore(booking.getRoom().getMaintenanceStart()) || booking.getStartTime().isAfter(booking.getRoom().getMaintenanceEnd()))) {
                    throw new com.example.bookingservice.exception.ConflictException("Room is under maintenance");
                }
            }

            // Enforce facility operating hours from settings
            com.example.bookingservice.model.FacilitySettings fs = facilitySettingsService.get();
            java.time.LocalTime open = fs.getOpenTime() != null ? fs.getOpenTime() : java.time.LocalTime.of(8,0);
            java.time.LocalTime close = fs.getCloseTime() != null ? fs.getCloseTime() : java.time.LocalTime.of(18,0);
            java.time.LocalTime s = booking.getStartTime().toLocalTime();
            java.time.LocalTime e = booking.getEndTime().toLocalTime();
            if (s.isBefore(open) || e.isAfter(close)) {
                throw new com.example.bookingservice.exception.ConflictException("Requested time is outside operating hours");
            }

            // If facility-wide maintenance window overlaps requested slot, reject
            if (fs.getMaintenanceStart() != null && fs.getMaintenanceEnd() != null) {
                if (!(booking.getEndTime().isBefore(fs.getMaintenanceStart()) || booking.getStartTime().isAfter(fs.getMaintenanceEnd()))) {
                    throw new com.example.bookingservice.exception.ConflictException("Facility maintenance window blocks bookings");
                }
            }

            boolean overlap = booking.getId() == null
                    ? bookingRepository.existsOverlapWithStatus(roomId, com.example.bookingservice.model.BookingStatus.APPROVED, booking.getStartTime(), booking.getEndTime())
                    : bookingRepository.existsOverlapWithStatusExcluding(roomId, com.example.bookingservice.model.BookingStatus.APPROVED, booking.getId(), booking.getStartTime(), booking.getEndTime());
            if (overlap) {
                throw new com.example.bookingservice.exception.ConflictException("This room already has an approved booking at that time. Please select a different time or room.");
            }

            // Resource quantity checks: ensure requested resources are available
            if (booking.getResourceReservations() != null && !booking.getResourceReservations().isEmpty()) {
                for (com.example.bookingservice.model.ResourceReservation rr : booking.getResourceReservations()) {
                    com.example.bookingservice.model.ResourceEntity res = rr.getResource();
                    if (res == null) throw new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid resourceId");
                    if (!Boolean.TRUE.equals(res.getActive())) throw new com.example.bookingservice.exception.ConflictException("Requested resource is not active");
                    Integer already = booking.getId() == null
                            ? resourceReservationRepository.sumReservedForResourceDuring(res.getId(), com.example.bookingservice.model.BookingStatus.APPROVED, booking.getStartTime(), booking.getEndTime())
                            : resourceReservationRepository.sumReservedForResourceDuringExcluding(res.getId(), com.example.bookingservice.model.BookingStatus.APPROVED, booking.getId(), booking.getStartTime(), booking.getEndTime());
                    int available = res.getQuantity() != null ? res.getQuantity() : 1;
                    int requested = rr.getQuantity() != null ? rr.getQuantity() : 1;
                    if (already + requested > available) {
                        throw new com.example.bookingservice.exception.ConflictException("Resource not available in requested quantity");
                    }
                }
            }
        }
    }

    public void deleteById(Long id) {
        bookingRepository.deleteById(id);
    }
}
