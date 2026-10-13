package org.fadhel.expoechoplatform.service;

import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.domain.Event;
import org.fadhel.expoechoplatform.exception.ApiException;
import org.fadhel.expoechoplatform.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public List<Event> upcomingWithin(int minutes) {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findByStartAtBetweenOrderByStartAtAsc(now.minusMinutes(5), now.plusMinutes(minutes));
    }

    @Transactional(readOnly = true)
    public Event get(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Event not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Event> all() {
        return eventRepository.findAll();
    }
}
