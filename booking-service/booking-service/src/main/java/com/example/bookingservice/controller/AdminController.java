package com.example.bookingservice.controller;

import com.example.bookingservice.model.ResourceEntity;
import com.example.bookingservice.model.Room;
import com.example.bookingservice.service.RoomService;
import com.example.bookingservice.repository.ResourceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {
    private final RoomService roomService;
    private final ResourceRepository resourceRepository;

    public AdminController(RoomService roomService, ResourceRepository resourceRepository) {
        this.roomService = roomService;
        this.resourceRepository = resourceRepository;
    }

    // Rooms
    @GetMapping("/rooms")
    public List<Room> listRooms() { return roomService.findAll(); }

    @PostMapping("/rooms")
    public Room createRoom(@RequestBody Room room) { return roomService.save(room); }

    @GetMapping("/rooms/{id}")
    public Room getRoom(@PathVariable Long id) { return roomService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid roomId")); }

    @PutMapping("/rooms/{id}")
    public Room updateRoom(@PathVariable Long id, @RequestBody Room room) {
        Room existing = roomService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid roomId"));
        existing.setName(room.getName());
        existing.setLocation(room.getLocation());
        existing.setCapacity(room.getCapacity());
        existing.setEquipment(room.getEquipment());
        existing.setActive(room.getActive());
        existing.setRequiresApproval(room.getRequiresApproval());
        existing.setMaintenance(room.getMaintenance());
        existing.setMaintenanceStart(room.getMaintenanceStart());
        existing.setMaintenanceEnd(room.getMaintenanceEnd());
        existing.setMaintenanceReason(room.getMaintenanceReason());
        return roomService.save(existing);
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid roomId"));
        // simple deletion via repository not exposed here; use roomService.save(null) not appropriate. For now throw unsupported if attempted.
        throw new UnsupportedOperationException("Room deletion not supported");
    }

    // Resources
    @GetMapping("/resources")
    public List<ResourceEntity> listResources() { return resourceRepository.findAll(); }

    @PostMapping("/resources")
    public ResourceEntity createResource(@RequestBody ResourceEntity r) { return resourceRepository.save(r); }

    @GetMapping("/resources/{id}")
    public ResourceEntity getResource(@PathVariable Long id) { return resourceRepository.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid resourceId")); }

    @PutMapping("/resources/{id}")
    public ResourceEntity updateResource(@PathVariable Long id, @RequestBody ResourceEntity r) {
        ResourceEntity existing = resourceRepository.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid resourceId"));
        existing.setName(r.getName());
        existing.setType(r.getType());
        existing.setQuantity(r.getQuantity());
        existing.setActive(r.getActive());
        return resourceRepository.save(existing);
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceRepository.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid resourceId"));
        resourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
