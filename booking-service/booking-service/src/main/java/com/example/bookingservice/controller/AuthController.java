package com.example.bookingservice.controller;

import com.example.bookingservice.model.AppUser;
import com.example.bookingservice.service.AuthService;
import com.example.bookingservice.service.AuditLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final AuthService authService;
    private final AuditLogService auditLogService;

    public AuthController(AuthService authService, AuditLogService auditLogService) {
        this.authService = authService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String identifier = body.get("username");
        String pass = body.get("password");
        try {
            String token = authService.login(identifier, pass);
            Optional<AppUser> userOpt = authService.findByUsername(identifier)
                    .or(() -> authService.findByEmail(identifier));
            String username = userOpt.map(AppUser::getUsername).orElse(identifier);
            String role = userOpt.map(AppUser::getRole).orElse("ROLE_USER");
            String name = userOpt.map(AppUser::getName).orElse(username);
            try {
                auditLogService.log("LOGIN", username, "User logged in successfully [status=SUCCESS]");
            } catch (Exception ignore) {}
            return ResponseEntity.ok(Map.of("token", token, "username", username, "role", role, "name", name));
        } catch (Exception ex) {
            try {
                auditLogService.log("LOGIN", identifier, String.format("Failed login attempt [status=FAILED reason=%s]", ex.getMessage()));
            } catch (Exception ignore) {}
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        String user = body.get("username");
        if (user != null && !user.isBlank()) {
            try {
                auditLogService.log("LOGOUT", user, "User logged out successfully [status=SUCCESS]");
            } catch (Exception ignore) {}
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String user = body.get("username");
        String pass = body.get("password");
        String name = body.get("name");
        String email = body.get("email");
        String role = body.getOrDefault("role", "ROLE_USER");
        try {
            AppUser u = authService.register(user, pass, role, name, email);
            try {
                auditLogService.log("REGISTER", user, String.format("Registered new user '%s' (%s) as %s [email=%s]", name, user, role.replace("ROLE_", "").toLowerCase(), email));
            } catch (Exception ignore) {}
            return ResponseEntity.ok(Map.of("username", u.getUsername()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<AppUser> userOpt = authService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not registered");
        }
        return ResponseEntity.ok(Map.of("email", email, "verified", true));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String newPass = body.get("newPassword");
        try {
            authService.updatePassword(email, newPass);
            Optional<AppUser> u = authService.findByEmail(email);
            String username = u.map(AppUser::getUsername).orElse("unknown");
            try {
                auditLogService.log("RESET_PASSWORD", username, String.format("Reset password successfully [email=%s]", email));
            } catch (Exception ignore) {}
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
}
