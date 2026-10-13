package org.fadhel.expoechoplatform.dto;

public record ScoreBreakdown(
        int interest,
        int proximity,
        int timing,
        int capacity,
        int popularity
) {
    public int total() {
        return interest + proximity + timing + capacity + popularity;
    }
}
