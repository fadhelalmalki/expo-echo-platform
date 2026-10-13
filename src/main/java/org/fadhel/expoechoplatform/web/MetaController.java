package org.fadhel.expoechoplatform.web;

import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.config.AppProperties;
import org.fadhel.expoechoplatform.dto.CategoryDto;
import org.fadhel.expoechoplatform.repository.CategoryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MetaController {

    private final CategoryRepository categoryRepository;
    private final AppProperties props;

    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(c -> c.getId() == null ? 0L : c.getId()))
                .map(CategoryDto::from)
                .toList();
    }

    @GetMapping("/config")
    public Map<String, Object> config() {
        return Map.of(
                "siteCenter", Map.of(
                        "lat", props.getSite().getCenterLat(),
                        "lng", props.getSite().getCenterLng()),
                "defaultRadiusMeters", props.getRecommendation().getDefaultRadiusMeters(),
                "maxRadiusMeters", props.getRecommendation().getMaxRadiusMeters(),
                "walkSpeedMetersPerMinute", props.getRecommendation().getWalkSpeedMetersPerMinute(),
                "reminderLeadMinutes", props.getRecommendation().getReminderLeadMinutes(),
                "aiEnabled", props.getAi().isEnabled()
        );
    }
}
