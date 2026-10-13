package org.fadhel.expoechoplatform.dto;

import org.fadhel.expoechoplatform.domain.Visitor;

import java.util.Comparator;
import java.util.List;

public record VisitorDto(
        String id,
        String displayName,
        List<CategoryDto> interests,
        Integer availableMinutes,
        Double latitude,
        Double longitude
) {
    public static VisitorDto from(Visitor v) {
        List<CategoryDto> interests = v.getInterests().stream()
                .sorted(Comparator.comparing(c -> c.getId() == null ? 0L : c.getId()))
                .map(CategoryDto::from)
                .toList();
        return new VisitorDto(v.getId(), v.getDisplayName(), interests,
                v.getAvailableMinutes(), v.getLatitude(), v.getLongitude());
    }
}
