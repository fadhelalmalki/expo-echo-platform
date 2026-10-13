package org.fadhel.expoechoplatform.service;

import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.domain.*;
import org.fadhel.expoechoplatform.dto.BookingDto;
import org.fadhel.expoechoplatform.exception.ApiException;
import org.fadhel.expoechoplatform.repository.BookingRepository;
import org.fadhel.expoechoplatform.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final VisitorService visitorService;
    private final NotificationService notificationService;

    @Transactional
    public BookingDto book(String visitorId, Long eventId) {
        Visitor visitor = visitorService.get(visitorId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> ApiException.notFound("Event not found: " + eventId));

        return bookingRepository.findByVisitorIdAndEventId(visitorId, eventId)
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .map(BookingDto::from)
                .orElseGet(() -> confirm(visitor, event));
    }

    private BookingDto confirm(Visitor visitor, Event event) {
        if (event.isFull()) {
            throw ApiException.conflict("Event is full");
        }
        Booking booking = bookingRepository.findByVisitorIdAndEventId(visitor.getId(), event.getId())
                .orElseGet(() -> Booking.builder()
                        .visitor(visitor)
                        .event(event)
                        .createdAt(LocalDateTime.now())
                        .build());
        booking.setStatus(BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);

        event.setBookedCount(event.getBookedCount() + 1);
        eventRepository.save(event);

        notificationService.createReminder(visitor, event);
        return BookingDto.from(saved);
    }

    @Transactional
    public BookingDto cancel(String visitorId, Long eventId) {
        Booking booking = bookingRepository.findByVisitorIdAndEventId(visitorId, eventId)
                .orElseThrow(() -> ApiException.notFound("No booking for this event"));
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            booking.setStatus(BookingStatus.CANCELLED);
            Event event = booking.getEvent();
            event.setBookedCount(Math.max(0, event.getBookedCount() - 1));
            eventRepository.save(event);
        }
        return BookingDto.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingDto> listForVisitor(String visitorId) {
        visitorService.get(visitorId);
        return bookingRepository.findByVisitorIdOrderByCreatedAtDesc(visitorId).stream()
                .map(BookingDto::from)
                .toList();
    }
}
