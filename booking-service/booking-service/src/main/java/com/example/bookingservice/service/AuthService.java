package com.example.bookingservice.service;

import com.example.bookingservice.model.AppUser;
import com.example.bookingservice.repository.UserRepository;
import com.example.bookingservice.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Optional<AppUser> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<AppUser> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public AppUser register(String username, String rawPassword, String role) {
        // Fallback overload for mock data initializer
        return register(username, rawPassword, role, username, username + "@smartreserve.com");
    }

    public AppUser register(String username, String rawPassword, String role, String name, String email) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        AppUser u = new AppUser(username, passwordEncoder.encode(rawPassword), role, name, email);
        return userRepository.save(u);
    }

    public String login(String identifier, String password) {
        var opt = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier));
        if (opt.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }
        var u = opt.get();
        if (!passwordEncoder.matches(password, u.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return jwtUtil.generateToken(u.getUsername(), u.getRole());
    }

    public void updatePassword(String email, String rawPassword) {
        AppUser u = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        u.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(u);
    }

    public AppUser save(AppUser user) {
        return userRepository.save(user);
    }
}
