package org.fadhel.expoechoplatform.dto;

import java.util.List;

public record UpdateVisitorRequest(
        List<String> interestCodes,
        Integer availableMinutes,
        Double latitude,
        Double longitude
) {
}
