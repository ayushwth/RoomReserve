package com.example.bookingservice.controller;

import com.example.bookingservice.model.ResourceEntity;
import com.example.bookingservice.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class ResourceController {
    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) { this.resourceService = resourceService; }

    @GetMapping
    public List<ResourceEntity> list() { return resourceService.findAll(); }

    @PostMapping
    public ResponseEntity<ResourceEntity> create(@RequestBody ResourceEntity r) { return ResponseEntity.ok(resourceService.save(r)); }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceEntity> update(@PathVariable Long id, @RequestBody ResourceEntity r) {
        var existing = resourceService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid resourceId"));
        existing.setName(r.getName()); existing.setType(r.getType()); existing.setQuantity(r.getQuantity()); existing.setActive(r.getActive());
        return ResponseEntity.ok(resourceService.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        var existing = resourceService.findById(id).orElseThrow(() -> new com.example.bookingservice.exception.ResourceNotFoundException("Please provide a valid resourceId"));
        existing.setActive(false);
        resourceService.save(existing);
        return ResponseEntity.ok().build();
    }
}
