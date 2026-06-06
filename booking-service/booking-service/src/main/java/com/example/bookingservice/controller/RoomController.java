package com.example.bookingservice.controller;

import com.example.bookingservice.dto.RoomDto;
import com.example.bookingservice.model.Room;
import com.example.bookingservice.service.RoomService;
import com.example.bookingservice.service.AuditLogService;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin
public class RoomController {
    private final RoomService roomService;
    private final ModelMapper mapper;
    private final AuditLogService auditLogService;

    public RoomController(RoomService roomService, ModelMapper mapper, AuditLogService auditLogService) {
        this.roomService = roomService;
        this.mapper = mapper;
        this.auditLogService = auditLogService;
    }

    private String currentActor() {
        return SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";
    }

    @GetMapping
    public List<RoomDto> list() {
        return roomService.findAll().stream()
                .map(r -> mapper.map(r, RoomDto.class))
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<RoomDto> create(@Valid @RequestBody RoomDto roomDto) {
        Room room = mapper.map(roomDto, Room.class);
        Room saved = roomService.save(room);
        try {
            auditLogService.log("CREATE_ROOM", currentActor(), "roomId=" + saved.getId() + " roomName=" + saved.getName());
        } catch (Exception ignore) {}
        return ResponseEntity.ok(mapper.map(saved, RoomDto.class));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomDto> update(@PathVariable Long id, @Valid @RequestBody RoomDto roomDto) {
        Room existing = roomService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid roomId"));
        
        boolean prevActive = Boolean.TRUE.equals(existing.getActive());
        boolean nextActive = Boolean.TRUE.equals(roomDto.getActive());

        mapper.map(roomDto, existing);
        Room saved = roomService.save(existing);

        try {
            if (prevActive != nextActive) {
                auditLogService.log(nextActive ? "ACTIVATE_ROOM" : "DEACTIVATE_ROOM", currentActor(), "roomId=" + saved.getId() + " roomName=" + saved.getName());
            } else {
                auditLogService.log("UPDATE_ROOM", currentActor(), "roomId=" + saved.getId() + " roomName=" + saved.getName());
            }
        } catch (Exception ignore) {}

        return ResponseEntity.ok(mapper.map(saved, RoomDto.class));
    }

    @GetMapping("/available")
    public List<RoomDto> available(@RequestParam("start") java.time.OffsetDateTime start,
                                   @RequestParam("end") java.time.OffsetDateTime end,
                                   @RequestParam(value = "capacity", required = false) Integer capacity,
                                   @RequestParam(value = "equipment", required = false) String equipment) {
        return roomService.findAvailable(start, end, capacity, equipment).stream().map(r -> mapper.map(r, RoomDto.class)).collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Room existing = roomService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid roomId"));
        try {
            roomService.deleteById(id);
            try {
                auditLogService.log("DELETE_ROOM", currentActor(), "roomId=" + id + " roomName=" + existing.getName());
            } catch (Exception ignore) {}
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT).body("Cannot delete room as it has active bookings. You can deactivate it instead.");
        }
    }
}
