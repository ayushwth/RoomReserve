package com.example.bookingservice.service;

import com.example.bookingservice.model.ResourceEntity;
import com.example.bookingservice.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {
    private final ResourceRepository repo;
    public ResourceService(ResourceRepository repo) { this.repo = repo; }
    public List<ResourceEntity> findAll() { return repo.findAll(); }
    public ResourceEntity save(ResourceEntity r) { return repo.save(r); }
    public java.util.Optional<ResourceEntity> findById(Long id) { return repo.findById(id); }
    public void deleteById(Long id) { repo.deleteById(id); }
}
