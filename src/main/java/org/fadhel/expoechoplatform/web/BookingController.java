package org.fadhel.expoechoplatform.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.dto.BookingDto;
import org.fadhel.expoechoplatform.dto.BookingRequest;
import org.fadhel.expoechoplatform.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public BookingDto book(@Valid @RequestBody BookingRequest request) {
        return bookingService.book(request.visitorId(), request.eventId());
    }

    @DeleteMapping
    public BookingDto cancel(@RequestParam String visitorId, @RequestParam Long eventId) {
        return bookingService.cancel(visitorId, eventId);
    }

    @GetMapping
    public List<BookingDto> list(@RequestParam String visitorId) {
        return bookingService.listForVisitor(visitorId);
    }
}
