package org.fadhel.expoechoplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookingRequest(
        @NotBlank String visitorId,
        @NotNull Long eventId
) {
}
