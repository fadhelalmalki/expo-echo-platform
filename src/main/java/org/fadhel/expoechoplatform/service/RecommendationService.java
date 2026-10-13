package org.fadhel.expoechoplatform.service;

import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.config.AppProperties;
import org.fadhel.expoechoplatform.domain.BookingStatus;
import org.fadhel.expoechoplatform.domain.Event;
import org.fadhel.expoechoplatform.domain.Visitor;
import org.fadhel.expoechoplatform.dto.*;
import org.fadhel.expoechoplatform.repository.BookingRepository;
import org.fadhel.expoechoplatform.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final int MIN_RESULTS = 6;

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final ScoringService scoringService;
    private final AiReasonService aiReasonService;
    private final AppProperties props;

    @Transactional(readOnly = true)
    public RecommendationResponse recommend(Visitor visitor, Integer minutes, Integer radiusMeters, int limit) {
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
        int window = resolveWindow(visitor, minutes);
        int radius = resolveRadius(radiusMeters);
        int maxRadius = props.getRecommendation().getMaxRadiusMeters();

        Set<Long> bookedEventIds = bookingRepository.findByVisitorIdOrderByCreatedAtDesc(visitor.getId()).stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .map(b -> b.getEvent().getId())
                .collect(Collectors.toSet());

        List<Event> pool = eventRepository.findByStartAtAfterOrderByStartAtAsc(now.minusMinutes(2));
        List<EventCard> scored = pool.stream()
                .map(e -> buildCard(visitor, e, now, bookedEventIds))
                .collect(Collectors.toList());

        List<EventCard> result = rank(scored, radius, window, limit);
        if (result.size() < MIN_RESULTS) {
            List<EventCard> relaxed = rank(scored, maxRadius, Math.max(window * 3, 120), limit);
            result = merge(result, relaxed, limit);
        }

        result = applyAiReasons(visitor, result, 5);
        return new RecommendationResponse(result, now, radius, window, VisitorDto.from(visitor));
    }

    private List<EventCard> rank(List<EventCard> cards, int radius, int window, int limit) {
        return cards.stream()
                .filter(c -> c.minutesToStart() <= window + 2)
                .filter(c -> c.distanceMeters() == null || c.distanceMeters() <= radius)
                .sorted(Comparator.comparingInt(EventCard::matchScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<EventCard> merge(List<EventCard> primary, List<EventCard> secondary, int limit) {
        Map<Long, EventCard> byId = new LinkedHashMap<>();
        primary.forEach(c -> byId.put(c.id(), c));
        secondary.forEach(c -> byId.putIfAbsent(c.id(), c));
        return byId.values().stream()
                .sorted(Comparator.comparingInt(EventCard::matchScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<EventCard> applyAiReasons(Visitor visitor, List<EventCard> cards, int max) {
        if (cards.isEmpty()) {
            return cards;
        }
        Map<Long, ReasonPair> enriched = aiReasonService.enrich(visitor, cards, max);
        if (enriched.isEmpty()) {
            return cards;
        }
        return cards.stream()
                .map(c -> {
                    ReasonPair pair = enriched.get(c.id());
                    return pair == null ? c : withReason(c, pair);
                })
                .collect(Collectors.toList());
    }

    private EventCard buildCard(Visitor visitor, Event event, LocalDateTime now, Set<Long> bookedEventIds) {
        ScoreResult score = scoringService.score(visitor, event, now,
                props.getRecommendation().getDefaultRadiusMeters());
        long walkMinutes = scoringService.walkMinutes(score.distanceMeters());
        EventCard card = new EventCard(
                event.getId(), event.getTitleEn(), event.getTitleAr(),
                event.getDescriptionEn(), event.getDescriptionAr(),
                CategoryDto.from(event.getCategory()), VenueDto.from(event.getVenue()),
                event.getStartAt(), event.getEndAt(),
                event.getCapacity(), event.getBookedCount(), event.seatsLeft(),
                event.getLanguage(), EventResponse.splitTags(event.getTags()), event.getImageUrl(),
                score.score(), score.breakdown(), score.distanceMeters(),
                score.minutesToStart(), walkMinutes,
                bookedEventIds.contains(event.getId()), event.isFull(), null, null);
        return withReason(card, aiReasonService.template(card));
    }

    private EventCard withReason(EventCard c, ReasonPair reason) {
        return new EventCard(
                c.id(), c.titleEn(), c.titleAr(), c.descriptionEn(), c.descriptionAr(),
                c.category(), c.venue(), c.startAt(), c.endAt(), c.capacity(), c.bookedCount(),
                c.seatsLeft(), c.language(), c.tags(), c.imageUrl(), c.matchScore(), c.breakdown(),
                c.distanceMeters(), c.minutesToStart(), c.walkMinutes(), c.booked(), c.full(),
                reason.en(), reason.ar());
    }

    private int resolveWindow(Visitor visitor, Integer minutes) {
        if (minutes != null && minutes > 0) {
            return minutes;
        }
        if (visitor.getAvailableMinutes() != null && visitor.getAvailableMinutes() > 0) {
            return visitor.getAvailableMinutes();
        }
        return 60;
    }

    private int resolveRadius(Integer radiusMeters) {
        int max = props.getRecommendation().getMaxRadiusMeters();
        if (radiusMeters != null && radiusMeters > 0) {
            return Math.min(radiusMeters, max);
        }
        return props.getRecommendation().getDefaultRadiusMeters();
    }
}
