package com.example.bookingservice.controller;

import com.example.bookingservice.model.AppUser;
import com.example.bookingservice.service.AuthService;
import com.example.bookingservice.service.AuditLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users/profile")
@CrossOrigin
public class ProfileController {
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public ProfileController(AuthService authService, PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    private String currentActor() {
        return SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : null;
    }

    @GetMapping
    public ResponseEntity<?> getProfile() {
        String username = currentActor();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Optional<AppUser> userOpt = authService.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        AppUser u = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "name", u.getName() != null ? u.getName() : "",
                "email", u.getEmail() != null ? u.getEmail() : "",
                "username", u.getUsername(),
                "role", u.getRole()
        ));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        String username = currentActor();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Optional<AppUser> userOpt = authService.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        AppUser u = userOpt.get();

        String name = body.get("name");
        String email = body.get("email");
        String pass = body.get("password");

        // Validate unique email if changed
        if (email != null && !email.equalsIgnoreCase(u.getEmail())) {
            if (authService.findByEmail(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already taken");
            }
            u.setEmail(email);
        }

        if (name != null) {
            u.setName(name);
        }

        if (pass != null && !pass.isBlank()) {
            u.setPassword(passwordEncoder.encode(pass));
        }

        AppUser saved = authService.save(u);
        try {
            auditLogService.log("UPDATE_PROFILE", username, "email=" + saved.getEmail());
        } catch (Exception ignore) {}

        return ResponseEntity.ok(Map.of(
                "name", saved.getName() != null ? saved.getName() : "",
                "email", saved.getEmail() != null ? saved.getEmail() : "",
                "username", saved.getUsername(),
                "role", saved.getRole()
        ));
    }
}
