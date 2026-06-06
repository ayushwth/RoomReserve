package com.example.bookingservice.repository;

import com.example.bookingservice.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    java.util.Optional<Room> findByNameIgnoreCase(String name);
    java.util.Optional<Room> findByLocationIgnoreCase(String location);
}
