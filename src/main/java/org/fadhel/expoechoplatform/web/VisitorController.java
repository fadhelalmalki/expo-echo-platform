package org.fadhel.expoechoplatform.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.dto.CreateVisitorRequest;
import org.fadhel.expoechoplatform.dto.UpdateVisitorRequest;
import org.fadhel.expoechoplatform.dto.VisitorDto;
import org.fadhel.expoechoplatform.service.VisitorService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
public class VisitorController {

    private final VisitorService visitorService;

    @PostMapping
    public VisitorDto create(@Valid @RequestBody CreateVisitorRequest request) {
        return VisitorDto.from(visitorService.create(request));
    }

    @GetMapping("/{id}")
    public VisitorDto get(@PathVariable String id) {
        return VisitorDto.from(visitorService.get(id));
    }

    @PutMapping("/{id}")
    public VisitorDto update(@PathVariable String id, @RequestBody UpdateVisitorRequest request) {
        return VisitorDto.from(visitorService.update(id, request));
    }
}
