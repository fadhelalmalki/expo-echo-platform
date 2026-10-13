package org.fadhel.expoechoplatform.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.fadhel.expoechoplatform.config.AppProperties;
import org.fadhel.expoechoplatform.domain.AppNotification;
import org.fadhel.expoechoplatform.domain.Event;
import org.fadhel.expoechoplatform.domain.Visitor;
import org.fadhel.expoechoplatform.dto.NotificationDto;
import org.fadhel.expoechoplatform.repository.AppNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final AppNotificationRepository repository;
    private final AppProperties props;

    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String visitorId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        emitters.computeIfAbsent(visitorId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(visitorId, emitter));
        emitter.onTimeout(() -> remove(visitorId, emitter));
        emitter.onError(e -> remove(visitorId, emitter));

        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException e) {
            remove(visitorId, emitter);
        }
        return emitter;
    }

    private void remove(String visitorId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(visitorId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                emitters.remove(visitorId);
            }
        }
    }

    public void publish(String visitorId, NotificationDto dto) {
        List<SseEmitter> list = emitters.get(visitorId);
        if (list == null) {
            return;
        }
        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event().name("reminder").data(dto));
            } catch (Exception e) {
                remove(visitorId, emitter);
            }
        }
    }

    @Transactional
    public AppNotification createReminder(Visitor visitor, Event event) {
        if (repository.existsByVisitorIdAndEventId(visitor.getId(), event.getId())) {
            return null;
        }
        LocalDateTime lead = event.getStartAt()
                .minusMinutes(props.getRecommendation().getReminderLeadMinutes());
        LocalDateTime fireAt = lead.isBefore(LocalDateTime.now()) ? LocalDateTime.now() : lead;
        AppNotification notification = AppNotification.builder()
                .visitor(visitor)
                .event(event)
                .fireAt(fireAt)
                .sent(false)
                .messageEn("Starting soon: " + event.getTitleEn() + " at " + event.getVenue().getNameEn())
                .messageAr("يبدأ قريباً: " + event.getTitleAr() + " في " + event.getVenue().getNameAr())
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> listForVisitor(String visitorId) {
        return repository.findByVisitorIdOrderByFireAtDesc(visitorId).stream()
                .map(NotificationDto::from)
                .toList();
    }

    @Transactional
    public List<AppNotification> dueNotifications() {
        return repository.findBySentFalseAndFireAtLessThanEqual(LocalDateTime.now());
    }

    @Transactional
    public void markSent(AppNotification notification) {
        notification.setSent(true);
        repository.save(notification);
    }
}
