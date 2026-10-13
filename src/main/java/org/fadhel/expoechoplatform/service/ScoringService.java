package org.fadhel.expoechoplatform.service;

import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.config.AppProperties;
import org.fadhel.expoechoplatform.domain.Event;
import org.fadhel.expoechoplatform.domain.Visitor;
import org.fadhel.expoechoplatform.dto.ScoreBreakdown;
import org.fadhel.expoechoplatform.dto.ScoreResult;
import org.fadhel.expoechoplatform.util.GeoUtils;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Deterministic, explainable match scoring. The AI layer only enriches the wording,
 * never the score, so the live demo stays fast and reliable.
 */
@Service
@RequiredArgsConstructor
public class ScoringService {

    private static final int W_INTEREST = 40;
    private static final int W_PROXIMITY = 25;
    private static final int W_TIMING = 20;
    private static final int W_CAPACITY = 10;
    private static final int W_POPULARITY = 5;

    private final AppProperties props;

    public ScoreResult score(Visitor visitor, Event event, LocalDateTime now, int radiusMeters) {
        long minutesToStart = Duration.between(now, event.getStartAt()).toMinutes();

        int interest = interestScore(visitor, event);
        Integer distance = distanceTo(visitor, event);
        int proximity = proximityScore(distance, radiusMeters);
        int timing = timingScore(minutesToStart, visitor.getAvailableMinutes());
        int capacity = capacityScore(event);
        int popularity = popularityScore(event);

        ScoreBreakdown breakdown = new ScoreBreakdown(interest, proximity, timing, capacity, popularity);
        int total = Math.max(0, Math.min(100, breakdown.total()));
        return new ScoreResult(total, breakdown, distance, minutesToStart);
    }

    public Integer distanceTo(Visitor visitor, Event event) {
        if (visitor.getLatitude() == null || visitor.getLongitude() == null
                || event.getVenue() == null) {
            return null;
        }
        return (int) Math.round(GeoUtils.haversineMeters(
                visitor.getLatitude(), visitor.getLongitude(),
                event.getVenue().getLatitude(), event.getVenue().getLongitude()));
    }

    public long walkMinutes(Integer distanceMeters) {
        if (distanceMeters == null) {
            return 0;
        }
        int speed = Math.max(30, props.getRecommendation().getWalkSpeedMetersPerMinute());
        return Math.max(1, Math.round((float) distanceMeters / speed));
    }

    private int interestScore(Visitor visitor, Event event) {
        Set<String> interestCodes = visitor.getInterests().stream()
                .map(c -> c.getCode().toLowerCase())
                .collect(Collectors.toSet());
        if (interestCodes.isEmpty()) {
            return W_INTEREST / 2;
        }
        String categoryCode = event.getCategory().getCode().toLowerCase();
        if (interestCodes.contains(categoryCode)) {
            return W_INTEREST;
        }
        Set<String> tags = event.getTags() == null ? Set.of()
                : Set.of(event.getTags().toLowerCase().split("\\s*,\\s*"));
        long overlap = tags.stream().filter(interestCodes::contains).count();
        if (overlap > 0) {
            return (int) Math.round(W_INTEREST * (0.45 + 0.1 * Math.min(overlap, 3)));
        }
        return (int) Math.round(W_INTEREST * 0.15);
    }

    private int proximityScore(Integer distance, int radiusMeters) {
        if (distance == null) {
            return W_PROXIMITY / 2;
        }
        int radius = Math.max(50, radiusMeters);
        double ratio = Math.max(0, 1 - (double) distance / radius);
        return (int) Math.round(W_PROXIMITY * Math.pow(ratio, 0.85));
    }

    private int timingScore(long minutesToStart, Integer availableMinutes) {
        if (minutesToStart < -5) {
            return 0;
        }
        int window = availableMinutes == null || availableMinutes <= 0 ? 60 : availableMinutes;
        if (minutesToStart <= window) {
            double closeness = 1 - ((double) Math.max(0, minutesToStart) / window) * 0.6;
            return (int) Math.round(W_TIMING * closeness);
        }
        double over = minutesToStart - (double) window;
        return (int) Math.max(0, Math.round(W_TIMING - over * 0.3));
    }

    private int capacityScore(Event event) {
        if (event.getCapacity() <= 0 || event.isFull()) {
            return 0;
        }
        double ratio = (double) event.seatsLeft() / event.getCapacity();
        return (int) Math.round(W_CAPACITY * Math.min(1, ratio * 1.5));
    }

    private int popularityScore(Event event) {
        int popularity = Math.max(0, Math.min(100, event.getPopularity()));
        return (int) Math.round(W_POPULARITY * (popularity / 100.0));
    }
}
