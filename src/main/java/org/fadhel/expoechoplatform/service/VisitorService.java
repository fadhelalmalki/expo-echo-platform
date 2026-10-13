package org.fadhel.expoechoplatform.service;

import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.domain.Category;
import org.fadhel.expoechoplatform.domain.Visitor;
import org.fadhel.expoechoplatform.dto.CreateVisitorRequest;
import org.fadhel.expoechoplatform.dto.UpdateVisitorRequest;
import org.fadhel.expoechoplatform.exception.ApiException;
import org.fadhel.expoechoplatform.repository.CategoryRepository;
import org.fadhel.expoechoplatform.repository.VisitorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class VisitorService {

    private final VisitorRepository visitorRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public Visitor create(CreateVisitorRequest request) {
        Visitor visitor = Visitor.builder()
                .displayName(request.displayName().trim())
                .interests(resolveInterests(request.interestCodes()))
                .availableMinutes(request.availableMinutes())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .createdAt(LocalDateTime.now())
                .build();
        return visitorRepository.save(visitor);
    }

    @Transactional(readOnly = true)
    public Visitor get(String id) {
        return visitorRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Visitor not found: " + id));
    }

    @Transactional
    public Visitor update(String id, UpdateVisitorRequest request) {
        Visitor visitor = get(id);
        if (request.interestCodes() != null) {
            visitor.setInterests(resolveInterests(request.interestCodes()));
        }
        if (request.availableMinutes() != null) {
            visitor.setAvailableMinutes(request.availableMinutes());
        }
        if (request.latitude() != null) {
            visitor.setLatitude(request.latitude());
        }
        if (request.longitude() != null) {
            visitor.setLongitude(request.longitude());
        }
        return visitorRepository.save(visitor);
    }

    private Set<Category> resolveInterests(List<String> codes) {
        Set<Category> result = new HashSet<>();
        if (codes == null) {
            return result;
        }
        for (String code : codes) {
            if (code == null || code.isBlank()) {
                continue;
            }
            categoryRepository.findByCode(code.trim().toUpperCase())
                    .ifPresent(result::add);
        }
        return result;
    }
}
