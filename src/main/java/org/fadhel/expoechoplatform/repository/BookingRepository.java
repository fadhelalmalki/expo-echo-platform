package org.fadhel.expoechoplatform.repository;

import org.fadhel.expoechoplatform.domain.Booking;
import org.fadhel.expoechoplatform.domain.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByVisitorIdOrderByCreatedAtDesc(String visitorId);

    Optional<Booking> findByVisitorIdAndEventId(String visitorId, Long eventId);

    long countByEventIdAndStatus(Long eventId, BookingStatus status);

    List<Booking> findByEventIdAndStatus(Long eventId, BookingStatus status);
}
