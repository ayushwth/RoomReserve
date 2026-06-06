package com.example.bookingservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    private final Key key = Keys.hmacShaKeyFor("SmartReserveDefaultSecureTokenSigningKey2026SuperSecretKeyMustBeLong".getBytes(java.nio.charset.StandardCharsets.UTF_8));
    private final long validity = 1000L * 60 * 60 * 8; // 8 hours

    public String generateToken(String username, String role) {
        Date now = new Date();
        return Jwts.builder().setSubject(username).claim("role", role).setIssuedAt(now).setExpiration(new Date(now.getTime() + validity)).signWith(key).compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    public boolean isTokenValid(String token) {
        try { return parseToken(token).getExpiration().after(new Date()); } catch (Exception e) { return false; }
    }
}
