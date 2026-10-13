package org.fadhel.expoechoplatform.dto;

import java.time.LocalDateTime;
import java.util.List;

public record RecommendationResponse(
        List<EventCard> cards,
        LocalDateTime generatedAt,
        int radiusMeters,
        Integer availableMinutes,
        VisitorDto visitor
) {
}
