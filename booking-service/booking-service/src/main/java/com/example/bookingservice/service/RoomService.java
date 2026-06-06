package com.example.bookingservice.service;

import com.example.bookingservice.model.BookingStatus;
import com.example.bookingservice.model.Room;
import com.example.bookingservice.repository.BookingRepository;
import com.example.bookingservice.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomService {
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final com.example.bookingservice.repository.ResourceRepository resourceRepository;

    public RoomService(RoomRepository roomRepository, BookingRepository bookingRepository, com.example.bookingservice.repository.ResourceRepository resourceRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public Room save(Room room) {
        if (room.getName() == null || room.getName().isBlank()) {
            throw new com.example.bookingservice.exception.ConflictException("Please provide a valid room name");
        }
        roomRepository.findByNameIgnoreCase(room.getName()).ifPresent(existing -> {
            if (room.getId() == null || !existing.getId().equals(room.getId())) {
                throw new com.example.bookingservice.exception.ConflictException("A room with this name already exists. Use a unique room name.");
            }
        });
        if (room.getLocation() != null && !room.getLocation().isBlank()) {
            roomRepository.findByLocationIgnoreCase(room.getLocation().trim()).ifPresent(existing -> {
                if (room.getId() == null || !existing.getId().equals(room.getId())) {
                    throw new com.example.bookingservice.exception.ConflictException("A room already exists at location: " + room.getLocation() + ". Please select a different location.");
                }
            });
        }
        return roomRepository.save(room);
    }

    public java.util.Optional<Room> findById(Long id) {
        return roomRepository.findById(id);
    }

    public List<Room> findAvailable(OffsetDateTime start, OffsetDateTime end, Integer capacity, String equipment) {
        return roomRepository.findAll().stream().filter(r -> {
            if (!Boolean.TRUE.equals(r.getActive())) return false;
            if (capacity != null && r.getCapacity() < capacity) return false;
            if (equipment != null && !equipment.isBlank()) {
                String[] parts = (r.getEquipment() == null ? "" : r.getEquipment()).split(",");
                boolean has = java.util.Arrays.stream(parts).map(String::trim).anyMatch(s -> s.equalsIgnoreCase(equipment.trim()));
                if (!has) return false;
            }
            if (Boolean.TRUE.equals(r.getMaintenance())) return false;
            if (r.getMaintenanceStart() != null && r.getMaintenanceEnd() != null) {
                if (!(end.isBefore(r.getMaintenanceStart()) || start.isAfter(r.getMaintenanceEnd()))) return false;
            }
            // check for overlapping APPROVED bookings
            boolean overlap = bookingRepository.existsOverlapWithStatus(r.getId(), BookingStatus.APPROVED, start, end);
            return !overlap;
        }).collect(Collectors.toList());
    }

    public java.util.Optional<com.example.bookingservice.model.ResourceEntity> findResourceById(Long id) {
        return resourceRepository.findById(id);
    }

    public void deleteById(Long id) {
        roomRepository.deleteById(id);
    }
}
