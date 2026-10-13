package org.fadhel.expoechoplatform.repository;

import org.fadhel.expoechoplatform.domain.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {

    List<AppNotification> findBySentFalseAndFireAtLessThanEqual(LocalDateTime moment);

    List<AppNotification> findByVisitorIdOrderByFireAtDesc(String visitorId);

    boolean existsByVisitorIdAndEventId(String visitorId, Long eventId);
}
