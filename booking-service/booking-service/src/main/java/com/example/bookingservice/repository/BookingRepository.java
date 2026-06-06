package com.example.bookingservice.repository;

import com.example.bookingservice.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;

public interface BookingRepository extends JpaRepository<Booking, Long> {

	@Query("select case when count(b)>0 then true else false end from Booking b where b.room.id = :roomId and b.status = :status and b.startTime < :endTime and b.endTime > :startTime")
	boolean existsOverlapWithStatus(@Param("roomId") Long roomId, @Param("status") com.example.bookingservice.model.BookingStatus status, @Param("startTime") OffsetDateTime startTime, @Param("endTime") OffsetDateTime endTime);

	@Query("select case when count(b)>0 then true else false end from Booking b where b.room.id = :roomId and b.status = :status and b.id <> :bookingId and b.startTime < :endTime and b.endTime > :startTime")
	boolean existsOverlapWithStatusExcluding(@Param("roomId") Long roomId, @Param("status") com.example.bookingservice.model.BookingStatus status, @Param("bookingId") Long bookingId, @Param("startTime") OffsetDateTime startTime, @Param("endTime") OffsetDateTime endTime);

	java.util.List<Booking> findByStatus(com.example.bookingservice.model.BookingStatus status);

	java.util.List<Booking> findByCreatedBy(String createdBy);
}
