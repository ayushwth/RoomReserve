package com.example.bookingservice.repository;

import com.example.bookingservice.model.ResourceReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;

public interface ResourceReservationRepository extends JpaRepository<ResourceReservation, Long> {

    @Query("select coalesce(sum(rr.quantity),0) from ResourceReservation rr join rr.booking b where rr.resource.id = :resourceId and b.status = :status and b.startTime < :endTime and b.endTime > :startTime")
    Integer sumReservedForResourceDuring(@Param("resourceId") Long resourceId, @Param("status") com.example.bookingservice.model.BookingStatus status, @Param("startTime") OffsetDateTime startTime, @Param("endTime") OffsetDateTime endTime);

    @Query("select coalesce(sum(rr.quantity),0) from ResourceReservation rr join rr.booking b where rr.resource.id = :resourceId and b.status = :status and b.id <> :bookingId and b.startTime < :endTime and b.endTime > :startTime")
    Integer sumReservedForResourceDuringExcluding(@Param("resourceId") Long resourceId, @Param("status") com.example.bookingservice.model.BookingStatus status, @Param("bookingId") Long bookingId, @Param("startTime") OffsetDateTime startTime, @Param("endTime") OffsetDateTime endTime);
}
