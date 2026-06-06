package com.example.bookingservice.config;

import com.example.bookingservice.model.ResourceEntity;
import com.example.bookingservice.model.Room;
import com.example.bookingservice.repository.ResourceRepository;
import com.example.bookingservice.repository.RoomRepository;
import com.example.bookingservice.service.AuthService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {
    private final AuthService authService;
    private final RoomRepository roomRepository;
    private final ResourceRepository resourceRepository;
    private final com.example.bookingservice.service.AuditLogService auditLogService;

    public DataInitializer(AuthService authService, RoomRepository roomRepository, ResourceRepository resourceRepository, com.example.bookingservice.service.AuditLogService auditLogService) {
        this.authService = authService;
        this.roomRepository = roomRepository;
        this.resourceRepository = resourceRepository;
        this.auditLogService = auditLogService;
    }

    @PostConstruct
    public void init() {
        updateUserIfNull("admin", "adminpass", "ROLE_ADMIN", "Admin User", "admin@smartreserve.com");
        updateUserIfNull("alice", "password", "ROLE_USER", "Alice Employee", "alice@smartreserve.com");
        updateUserIfNull("approver", "approverpass", "ROLE_APPROVER", "Approver User", "approver@smartreserve.com");

        seedRoom("Maple Conference Hall", "Tower A, Floor 2", 18, "Projector, VC, Whiteboard, Speakerphone", true, false);
        seedRoom("Orion Boardroom", "Tower A, Floor 5", 32, "Projector, VC, Whiteboard, Catering Setup", true, true);
        seedRoom("Cedar Focus Room", "Tower B, Floor 1", 6, "Whiteboard, Monitor", true, false);
        seedRoom("Summit Training Hall", "Tower B, Floor 3", 60, "Projector, VC, Stage Mic, Recording Kit", true, true);
        seedRoom("Nexus Collaboration Room", "Tower C, Floor 4", 12, "Smart Display, Whiteboard, Speakerphone", true, false);

        seedResource("Portable Projector", "Display", 4, true);
        seedResource("Video Conference Kit", "VC Device", 3, true);
        seedResource("Wireless Microphone", "Audio", 6, true);
        seedResource("Whiteboard Kit", "Stationery", 8, true);
        seedResource("Presentation Clicker", "Accessory", 5, true);

        if (auditLogService.findAll().isEmpty()) {
            auditLogService.log("SYSTEM_START", "system", "System initialization completed successfully.");
            auditLogService.log("REGISTER", "system", "Registered new user 'Admin User' (admin) as administrator [email=admin@smartreserve.com]");
            auditLogService.log("REGISTER", "system", "Registered new user 'Alice Employee' (alice) as user [email=alice@smartreserve.com]");
            auditLogService.log("REGISTER", "system", "Registered new user 'Approver User' (approver) as approver [email=approver@smartreserve.com]");
            auditLogService.log("CREATE_ROOM", "system", "Created meeting room 'Maple Conference Hall' [roomId=1]");
            auditLogService.log("CREATE_ROOM", "system", "Created meeting room 'Orion Boardroom' [roomId=2]");
            auditLogService.log("CREATE_ROOM", "system", "Created meeting room 'Cedar Focus Room' [roomId=3]");
            auditLogService.log("CREATE_ROOM", "system", "Created meeting room 'Summit Training Hall' [roomId=4]");
            auditLogService.log("CREATE_ROOM", "system", "Created meeting room 'Nexus Collaboration Room' [roomId=5]");
            auditLogService.log("CREATE_RESOURCE", "system", "Created shared resource 'Video Conference Kit' [quantity=3]");
            auditLogService.log("CREATE_RESOURCE", "system", "Created shared resource 'Portable Projector' [quantity=4]");
        }
    }

    private void seedRoom(String name, String location, Integer capacity, String equipment, boolean active, boolean requiresApproval) {
        if (roomRepository.findByNameIgnoreCase(name).isPresent()) return;
        Room room = new Room();
        room.setName(name);
        room.setLocation(location);
        room.setCapacity(capacity);
        room.setEquipment(equipment);
        room.setActive(active);
        room.setRequiresApproval(requiresApproval);
        room.setMaintenance(false);
        roomRepository.save(room);
    }

    private void seedResource(String name, String type, Integer quantity, boolean active) {
        java.util.Optional<ResourceEntity> existing = resourceRepository.findAll().stream()
                .filter(r -> name.equalsIgnoreCase(r.getName()))
                .findFirst();
        if (existing.isPresent()) {
            ResourceEntity res = existing.get();
            res.setQuantity(quantity);
            res.setType(type);
            res.setActive(active);
            resourceRepository.save(res);
            return;
        }
        ResourceEntity resource = new ResourceEntity();
        resource.setName(name);
        resource.setType(type);
        resource.setQuantity(quantity);
        resource.setActive(active);
        resourceRepository.save(resource);
    }

    private void updateUserIfNull(String username, String rawPassword, String role, String name, String email) {
        authService.findByUsername(username).ifPresentOrElse(
            u -> {
                boolean changed = false;
                if (u.getName() == null || u.getName().isBlank()) {
                    u.setName(name);
                    changed = true;
                }
                if (u.getEmail() == null || u.getEmail().isBlank()) {
                    u.setEmail(email);
                    changed = true;
                }
                if (changed) {
                    authService.save(u);
                }
            },
            () -> {
                try {
                    authService.register(username, rawPassword, role, name, email);
                } catch (Exception ignored) {}
            }
        );
    }
}
