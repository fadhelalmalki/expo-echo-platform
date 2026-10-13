package org.fadhel.expoechoplatform.dto;

import java.time.LocalDateTime;
import java.util.List;

public record EventCard(
        Long id,
        String titleEn,
        String titleAr,
        String descriptionEn,
        String descriptionAr,
        CategoryDto category,
        VenueDto venue,
        LocalDateTime startAt,
        LocalDateTime endAt,
        int capacity,
        int bookedCount,
        int seatsLeft,
        String language,
        List<String> tags,
        String imageUrl,
        int matchScore,
        ScoreBreakdown breakdown,
        Integer distanceMeters,
        long minutesToStart,
        long walkMinutes,
        boolean booked,
        boolean full,
        String aiReasonEn,
        String aiReasonAr
) {
}
