package org.fadhel.expoechoplatform.dto;

public record ScoreResult(
        int score,
        ScoreBreakdown breakdown,
        Integer distanceMeters,
        long minutesToStart
) {
}
