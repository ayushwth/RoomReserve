package com.example.bookingservice.controller;

import com.example.bookingservice.dto.BookingRequest;
import com.example.bookingservice.dto.BookingDto;
import com.example.bookingservice.model.Booking;
import com.example.bookingservice.model.Room;
import com.example.bookingservice.service.BookingService;
import com.example.bookingservice.service.RoomService;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {
    private final BookingService bookingService;
    private final RoomService roomService;
    private final ModelMapper mapper;
    private final com.example.bookingservice.service.AuditLogService auditLogService;

    public BookingController(BookingService bookingService, RoomService roomService, ModelMapper mapper, com.example.bookingservice.service.AuditLogService auditLogService) {
        this.bookingService = bookingService;
        this.roomService = roomService;
        this.mapper = mapper;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<BookingDto> list(@RequestParam(required = false) String status, @RequestParam(required = false) String createdBy) {
        java.util.List<com.example.bookingservice.model.Booking> source;
        if (status != null) {
            try {
                com.example.bookingservice.model.BookingStatus bs = com.example.bookingservice.model.BookingStatus.valueOf(status);
                source = bookingService.findByStatus(bs);
            } catch (IllegalArgumentException ex) {
                throw new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid status");
            }
        } else if (createdBy != null && !createdBy.isBlank()) {
            source = bookingService.findByCreatedBy(createdBy);
        } else {
            source = bookingService.findAll();
        }
        return source.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<BookingDto> create(@Valid @RequestBody BookingRequest req) {
        // resolve room
        Room room = roomService.findById(req.getRoomId())
            .orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid roomId"));

        Booking b = new Booking();
        b.setRoom(room);
        b.setStartTime(req.getStartTime());
        b.setEndTime(req.getEndTime());
        b.setTitle(req.getTitle());
        b.setDescription(req.getDescription());
        b.setCreatedBy(req.getCreatedBy() != null && !req.getCreatedBy().isBlank() ? req.getCreatedBy() : currentActor());
        b.setStatus(Boolean.TRUE.equals(room.getRequiresApproval()) ? com.example.bookingservice.model.BookingStatus.PENDING : com.example.bookingservice.model.BookingStatus.APPROVED);

        // attach resource requests if provided
        if (req.getResources() != null) {
            for (com.example.bookingservice.dto.ResourceRequest rr : req.getResources()) {
                com.example.bookingservice.model.ResourceReservation res = new com.example.bookingservice.model.ResourceReservation();
                com.example.bookingservice.model.ResourceEntity re = roomService.findResourceById(rr.getResourceId()).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid resourceId"));
                res.setResource(re);
                res.setQuantity(rr.getQuantity() != null ? rr.getQuantity() : 1);
                res.setBooking(b);
                b.getResourceReservations().add(res);
            }
        }

        Booking saved = bookingService.save(b);
        try {
            String details = String.format("Created booking #%d '%s' for room '%s' [bookingId=%d roomId=%d]", saved.getId(), saved.getTitle(), saved.getRoom().getName(), saved.getId(), saved.getRoom().getId());
            auditLogService.log("CREATE_BOOKING", saved.getCreatedBy(), details);
        } catch (Exception ignore) {}
        return ResponseEntity.ok(toDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingDto> update(@PathVariable Long id, @Valid @RequestBody BookingRequest req) {
        Booking booking = bookingService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid bookingId"));
        assertCreatorOrAdmin(booking);
        Room room = roomService.findById(req.getRoomId())
            .orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid roomId"));

        booking.setRoom(room);
        booking.setStartTime(req.getStartTime());
        booking.setEndTime(req.getEndTime());
        booking.setTitle(req.getTitle());
        booking.setDescription(req.getDescription());
        booking.setStatus(Boolean.TRUE.equals(room.getRequiresApproval()) ? com.example.bookingservice.model.BookingStatus.PENDING : com.example.bookingservice.model.BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        booking.getResourceReservations().clear();
        if (req.getResources() != null) {
            for (com.example.bookingservice.dto.ResourceRequest rr : req.getResources()) {
                com.example.bookingservice.model.ResourceReservation res = new com.example.bookingservice.model.ResourceReservation();
                com.example.bookingservice.model.ResourceEntity re = roomService.findResourceById(rr.getResourceId()).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid resourceId"));
                res.setResource(re);
                res.setQuantity(rr.getQuantity() != null ? rr.getQuantity() : 1);
                res.setBooking(booking);
                booking.getResourceReservations().add(res);
            }
        }

        Booking saved = bookingService.save(booking);
        try {
            String details = String.format("Updated booking #%d '%s' for room '%s' [bookingId=%d roomId=%d]", saved.getId(), saved.getTitle(), saved.getRoom().getName(), saved.getId(), saved.getRoom().getId());
            auditLogService.log("UPDATE_BOOKING", currentActor(), details);
        } catch (Exception ignore) {}
        return ResponseEntity.ok(toDto(saved));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingDto> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        Booking booking = bookingService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid bookingId"));
        String status = body.get("status");
        String reason = body.get("reason");
        if (status == null) {
            throw new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid status");
        }
        try {
            com.example.bookingservice.model.BookingStatus bs = com.example.bookingservice.model.BookingStatus.valueOf(status);
            booking.setStatus(bs);
            if (bs == com.example.bookingservice.model.BookingStatus.REJECTED) booking.setRejectionReason(reason);
            Booking saved = bookingService.save(booking);
            try {
                String actionText = bs == com.example.bookingservice.model.BookingStatus.APPROVED ? "Approved" : "Rejected";
                String reasonSuffix = bs == com.example.bookingservice.model.BookingStatus.REJECTED && reason != null ? " (Reason: " + reason + ")" : "";
                String details = String.format("%s booking #%d '%s' for room '%s'%s [bookingId=%d roomId=%d]", actionText, id, saved.getTitle(), saved.getRoom().getName(), reasonSuffix, id, saved.getRoom().getId());
                auditLogService.log(bs == com.example.bookingservice.model.BookingStatus.APPROVED ? "APPROVE_BOOKING" : "REJECT_BOOKING", currentActor(), details);
            } catch (Exception ignore) {}
            return ResponseEntity.ok(toDto(saved));
        } catch (IllegalArgumentException ex) {
            throw new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid status");
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDto> cancel(@PathVariable Long id, @RequestBody(required = false) java.util.Map<String, String> body) {
        Booking booking = bookingService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid bookingId"));
        assertCreatorOrAdmin(booking);
        Booking saved = bookingService.cancel(booking, body != null ? body.get("reason") : null);
        try {
            String reasonSuffix = body != null && body.get("reason") != null ? " (Reason: " + body.get("reason") + ")" : "";
            String details = String.format("Cancelled booking #%d '%s' for room '%s'%s [bookingId=%d roomId=%d]", id, saved.getTitle(), saved.getRoom().getName(), reasonSuffix, id, saved.getRoom().getId());
            auditLogService.log("CANCEL_BOOKING", currentActor(), details);
        } catch (Exception ignore) {}
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Booking booking = bookingService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid bookingId"));
        assertCreatorOrAdmin(booking);
        bookingService.cancel(booking, "Cancelled by user");
        try {
            String details = String.format("Cancelled booking #%d '%s' for room '%s' (Reason: Cancelled by user) [bookingId=%d roomId=%d]", id, booking.getTitle(), booking.getRoom().getName(), id, booking.getRoom().getId());
            auditLogService.log("CANCEL_BOOKING", currentActor(), details);
        } catch (Exception ignore) {}
        return ResponseEntity.noContent().build();
    }

    private String currentActor() {
        return org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null
                ? org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";
    }

    private boolean isAdmin() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private void assertCreatorOrAdmin(Booking booking) {
        if (isAdmin()) return;
        if (booking.getCreatedBy() != null && booking.getCreatedBy().equals(currentActor())) return;
        throw new com.example.bookingservice.exception.ConflictException("Only the booking creator or an admin can modify this booking");
    }

    private BookingDto toDto(Booking b) {
        BookingDto dto = mapper.map(b, BookingDto.class);
        dto.setRoomId(b.getRoom() != null ? b.getRoom().getId() : null);
        dto.setRoomName(b.getRoom() != null ? b.getRoom().getName() : null);
        dto.setStatus(b.getStatus() != null ? b.getStatus().name() : null);
        dto.setResources(b.getResourceReservations().stream().map(rr -> new BookingDto.ResourceLine(
                rr.getResource() != null ? rr.getResource().getId() : null,
                rr.getResource() != null ? rr.getResource().getName() : null,
                rr.getResource() != null ? rr.getResource().getType() : null,
                rr.getQuantity()
        )).collect(Collectors.toList()));
        return dto;
    }
}
