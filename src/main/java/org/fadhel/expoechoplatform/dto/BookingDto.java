package org.fadhel.expoechoplatform.dto;

import org.fadhel.expoechoplatform.domain.Booking;
import org.fadhel.expoechoplatform.domain.BookingStatus;

import java.time.LocalDateTime;

public record BookingDto(
        Long id,
        Long eventId,
        String titleEn,
        String titleAr,
        String venueNameEn,
        String venueNameAr,
        LocalDateTime startAt,
        LocalDateTime endAt,
        CategoryDto category,
        BookingStatus status,
        LocalDateTime createdAt
) {
    public static BookingDto from(Booking b) {
        return new BookingDto(
                b.getId(), b.getEvent().getId(),
                b.getEvent().getTitleEn(), b.getEvent().getTitleAr(),
                b.getEvent().getVenue().getNameEn(), b.getEvent().getVenue().getNameAr(),
                b.getEvent().getStartAt(), b.getEvent().getEndAt(),
                CategoryDto.from(b.getEvent().getCategory()),
                b.getStatus(), b.getCreatedAt());
    }
}
