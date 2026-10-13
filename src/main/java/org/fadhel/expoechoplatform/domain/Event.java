package org.fadhel.expoechoplatform.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_event_start", columnList = "startAt"),
        @Index(name = "idx_event_category", columnList = "category_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titleEn;

    @Column(nullable = false)
    private String titleAr;

    @Column(length = 2000)
    private String descriptionEn;

    @Column(length = 2000)
    private String descriptionAr;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Column(nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false)
    private LocalDateTime endAt;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false)
    private int bookedCount;

    @Column(nullable = false)
    private String language;

    private String tags;

    private String imageUrl;

    @Column(nullable = false)
    private int popularity;

    public boolean isFull() {
        return bookedCount >= capacity;
    }

    public int seatsLeft() {
        return Math.max(0, capacity - bookedCount);
    }
}
