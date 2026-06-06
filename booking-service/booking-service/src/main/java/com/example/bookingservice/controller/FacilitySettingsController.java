package com.example.bookingservice.controller;

import com.example.bookingservice.model.FacilitySettings;
import com.example.bookingservice.service.FacilitySettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/facility")
@CrossOrigin
public class FacilitySettingsController {
    private final FacilitySettingsService service;

    public FacilitySettingsController(FacilitySettingsService service) { this.service = service; }

    @GetMapping
    public FacilitySettings get() { return service.get(); }

    @PutMapping
    public ResponseEntity<FacilitySettings> update(@RequestBody FacilitySettings settings) {
        FacilitySettings saved = service.save(settings);
        return ResponseEntity.ok(saved);
    }
}
