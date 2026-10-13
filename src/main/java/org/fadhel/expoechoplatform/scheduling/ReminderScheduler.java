package org.fadhel.expoechoplatform.scheduling;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.fadhel.expoechoplatform.domain.AppNotification;
import org.fadhel.expoechoplatform.dto.NotificationDto;
import org.fadhel.expoechoplatform.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Fires reminder alerts (default: 10 minutes before an event) over Server-Sent Events,
 * which the Angular client turns into Web Notifications.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final NotificationService notificationService;

    @Scheduled(fixedRate = 30_000, initialDelay = 15_000)
    public void dispatchDueReminders() {
        List<AppNotification> due = notificationService.dueNotifications();
        for (AppNotification notification : due) {
            notificationService.markSent(notification);
            notificationService.publish(notification.getVisitor().getId(), NotificationDto.from(notification));
            log.info("Reminder sent to {} for event {}", notification.getVisitor().getId(),
                    notification.getEvent().getId());
        }
    }
}
