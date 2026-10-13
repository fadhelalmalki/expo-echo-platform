package org.fadhel.expoechoplatform.dto;

import org.fadhel.expoechoplatform.domain.Event;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public record EventResponse(
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
        int popularity
) {
    public static EventResponse from(Event e) {
        return new EventResponse(
                e.getId(), e.getTitleEn(), e.getTitleAr(), e.getDescriptionEn(), e.getDescriptionAr(),
                CategoryDto.from(e.getCategory()), VenueDto.from(e.getVenue()),
                e.getStartAt(), e.getEndAt(), e.getCapacity(), e.getBookedCount(), e.seatsLeft(),
                e.getLanguage(), splitTags(e.getTags()), e.getImageUrl(), e.getPopularity());
    }

    public static List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
