package org.fadhel.expoechoplatform.repository;

import org.fadhel.expoechoplatform.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStartAtAfterOrderByStartAtAsc(LocalDateTime after);

    List<Event> findByStartAtBetweenOrderByStartAtAsc(LocalDateTime from, LocalDateTime to);

    List<Event> findByCategoryCodeOrderByStartAtAsc(String code);
}
