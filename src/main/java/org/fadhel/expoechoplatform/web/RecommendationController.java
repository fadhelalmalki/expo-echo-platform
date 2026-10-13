package org.fadhel.expoechoplatform.web;

import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.domain.Visitor;
import org.fadhel.expoechoplatform.dto.RecommendationResponse;
import org.fadhel.expoechoplatform.service.RecommendationService;
import org.fadhel.expoechoplatform.service.VisitorService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final VisitorService visitorService;

    @GetMapping
    public RecommendationResponse recommend(@RequestParam String visitorId,
                                            @RequestParam(required = false) Integer minutes,
                                            @RequestParam(required = false) Integer radius,
                                            @RequestParam(defaultValue = "20") int limit) {
        Visitor visitor = visitorService.get(visitorId);
        return recommendationService.recommend(visitor, minutes, radius, Math.max(1, Math.min(limit, 50)));
    }
}
