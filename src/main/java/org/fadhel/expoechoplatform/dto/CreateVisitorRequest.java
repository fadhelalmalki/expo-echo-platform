package org.fadhel.expoechoplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateVisitorRequest(
        @NotBlank @Size(max = 80) String displayName,
        List<String> interestCodes,
        Integer availableMinutes,
        Double latitude,
        Double longitude
) {
}
