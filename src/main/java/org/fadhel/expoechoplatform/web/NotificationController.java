package org.fadhel.expoechoplatform.web;

import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.dto.NotificationDto;
import org.fadhel.expoechoplatform.service.NotificationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationDto> list(@RequestParam String visitorId) {
        return notificationService.listForVisitor(visitorId);
    }

    @GetMapping("/stream")
    public SseEmitter stream(@RequestParam String visitorId) {
        return notificationService.subscribe(visitorId);
    }
}
