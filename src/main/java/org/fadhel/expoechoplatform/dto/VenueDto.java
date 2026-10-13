package org.fadhel.expoechoplatform.dto;

import org.fadhel.expoechoplatform.domain.Venue;

public record VenueDto(
        Long id,
        String nameEn,
        String nameAr,
        String areaCode,
        double latitude,
        double longitude
) {
    public static VenueDto from(Venue v) {
        if (v == null) {
            return null;
        }
        return new VenueDto(v.getId(), v.getNameEn(), v.getNameAr(), v.getAreaCode(),
                v.getLatitude(), v.getLongitude());
    }
}
