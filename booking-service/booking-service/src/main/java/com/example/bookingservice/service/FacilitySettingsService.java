package com.example.bookingservice.service;

import com.example.bookingservice.model.FacilitySettings;
import com.example.bookingservice.repository.FacilitySettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class FacilitySettingsService {
    private final FacilitySettingsRepository repo;

    public FacilitySettingsService(FacilitySettingsRepository repo) { this.repo = repo; }

    public FacilitySettings get() {
        return repo.findAll().stream().findFirst().orElseGet(() -> {
            FacilitySettings s = new FacilitySettings();
            return repo.save(s);
        });
    }

    public FacilitySettings save(FacilitySettings settings) { return repo.save(settings); }
}
