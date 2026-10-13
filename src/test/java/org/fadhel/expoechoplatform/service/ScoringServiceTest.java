package org.fadhel.expoechoplatform.service;

import org.fadhel.expoechoplatform.config.AppProperties;
import org.fadhel.expoechoplatform.domain.Category;
import org.fadhel.expoechoplatform.domain.Event;
import org.fadhel.expoechoplatform.domain.Venue;
import org.fadhel.expoechoplatform.domain.Visitor;
import org.fadhel.expoechoplatform.dto.ScoreResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ScoringServiceTest {

    private ScoringService scoringService;
    private Category technology;
    private Category art;
    private Venue nearVenue;
    private Venue farVenue;

    @BeforeEach
    void setUp() {
        scoringService = new ScoringService(new AppProperties());
        technology = Category.builder().id(1L).code("TECHNOLOGY").nameEn("Technology").nameAr("التقنية")
                .colorStart("#47266C").colorEnd("#95629E").icon("cpu").build();
        art = Category.builder().id(2L).code("ART").nameEn("Art").nameAr("الفن")
                .colorStart("#FAB712").colorEnd("#FFEE9B").icon("palette").build();
        nearVenue = Venue.builder().id(1L).nameEn("Tech Dome").nameAr("قبة التقنية").areaCode("TECH")
                .latitude(24.7690).longitude(46.6580).build();
        farVenue = Venue.builder().id(2L).nameEn("Far Hall").nameAr("قاعة بعيدة").areaCode("FAR")
                .latitude(24.8000).longitude(46.7000).build();
    }

    private Visitor visitor() {
        return Visitor.builder()
                .id("v1")
                .displayName("Test")
                .interests(Set.of(technology))
                .availableMinutes(30)
                .latitude(24.7690)
                .longitude(46.6580)
                .build();
    }

    private Event event(Category category, Venue venue, LocalDateTime start, int capacity, int booked) {
        return Event.builder()
                .id(10L).titleEn("t").titleAr("ت")
                .category(category).venue(venue)
                .startAt(start).endAt(start.plusMinutes(30))
                .capacity(capacity).bookedCount(booked)
                .language("en").popularity(80)
                .build();
    }

    @Test
    void matchingInterestScoresHigherThanNonMatching() {
        Visitor v = visitor();
        LocalDateTime now = LocalDateTime.now();
        Event matching = event(technology, nearVenue, now.plusMinutes(5), 100, 10);
        Event nonMatching = event(art, nearVenue, now.plusMinutes(5), 100, 10);

        ScoreResult matchScore = scoringService.score(v, matching, now, 600);
        ScoreResult nonMatchScore = scoringService.score(v, nonMatching, now, 600);

        assertThat(matchScore.score()).isGreaterThan(nonMatchScore.score());
        assertThat(matchScore.breakdown().interest()).isGreaterThan(nonMatchScore.breakdown().interest());
    }

    @Test
    void closerEventScoresHigherOnProximity() {
        Visitor v = visitor();
        LocalDateTime now = LocalDateTime.now();
        Event near = event(technology, nearVenue, now.plusMinutes(5), 100, 10);
        Event far = event(technology, farVenue, now.plusMinutes(5), 100, 10);

        ScoreResult nearResult = scoringService.score(v, near, now, 600);
        ScoreResult farResult = scoringService.score(v, far, now, 600);

        assertThat(nearResult.breakdown().proximity()).isGreaterThan(farResult.breakdown().proximity());
        assertThat(nearResult.distanceMeters()).isLessThan(farResult.distanceMeters());
    }

    @Test
    void fullEventHasNoCapacityScore() {
        Visitor v = visitor();
        LocalDateTime now = LocalDateTime.now();
        Event full = event(technology, nearVenue, now.plusMinutes(5), 100, 100);

        ScoreResult result = scoringService.score(v, full, now, 600);

        assertThat(result.breakdown().capacity()).isZero();
    }

    @Test
    void scoreIsBoundedBetweenZeroAndHundred() {
        Visitor v = visitor();
        LocalDateTime now = LocalDateTime.now();
        Event soonClose = event(technology, nearVenue, now.plusMinutes(1), 1000, 1);

        ScoreResult result = scoringService.score(v, soonClose, now, 600);

        assertThat(result.score()).isBetween(0, 100);
        assertThat(result.score()).isGreaterThan(50);
    }
}
