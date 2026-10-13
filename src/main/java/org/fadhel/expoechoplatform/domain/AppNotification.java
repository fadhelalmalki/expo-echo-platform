package org.fadhel.expoechoplatform.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_notifications", indexes = {
        @Index(name = "idx_notif_visitor_sent", columnList = "visitor_id,sent")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "visitor_id")
    private Visitor visitor;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(nullable = false)
    private LocalDateTime fireAt;

    @Column(nullable = false)
    private boolean sent;

    @Column(nullable = false)
    private String messageEn;

    @Column(nullable = false)
    private String messageAr;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
