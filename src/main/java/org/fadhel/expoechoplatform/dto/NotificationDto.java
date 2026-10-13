package org.fadhel.expoechoplatform.dto;

import org.fadhel.expoechoplatform.domain.AppNotification;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        Long eventId,
        String titleEn,
        String titleAr,
        String venueNameEn,
        String venueNameAr,
        LocalDateTime fireAt,
        LocalDateTime startAt,
        String messageEn,
        String messageAr,
        boolean sent
) {
    public static NotificationDto from(AppNotification n) {
        return new NotificationDto(
                n.getId(), n.getEvent().getId(),
                n.getEvent().getTitleEn(), n.getEvent().getTitleAr(),
                n.getEvent().getVenue().getNameEn(), n.getEvent().getVenue().getNameAr(),
                n.getFireAt(), n.getEvent().getStartAt(),
                n.getMessageEn(), n.getMessageAr(), n.isSent());
    }
}
