package org.fadhel.expoechoplatform.web;

import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.dto.EventResponse;
import org.fadhel.expoechoplatform.service.EventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public List<EventResponse> list(@RequestParam(defaultValue = "240") int within) {
        return eventService.upcomingWithin(Math.max(1, Math.min(within, 2880))).stream()
                .map(EventResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable Long id) {
        return EventResponse.from(eventService.get(id));
    }
}
