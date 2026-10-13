package org.fadhel.expoechoplatform.web;

import lombok.RequiredArgsConstructor;
import org.fadhel.expoechoplatform.domain.Event;
import org.fadhel.expoechoplatform.service.EventService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class CalendarController {

    private static final DateTimeFormatter ICS = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");

    private final EventService eventService;

    @GetMapping("/{id}/calendar.ics")
    public ResponseEntity<byte[]> calendar(@PathVariable Long id) {
        Event event = eventService.get(id);
        String uid = "event-" + event.getId() + "@expoecho";
        String body = String.join("\r\n",
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Expo Echo//EN",
                "CALSCALE:GREGORIAN",
                "BEGIN:VEVENT",
                "UID:" + uid,
                "DTSTAMP:" + ICS.format(event.getStartAt()),
                "DTSTART;TZID=Asia/Riyadh:" + ICS.format(event.getStartAt()),
                "DTEND;TZID=Asia/Riyadh:" + ICS.format(event.getEndAt()),
                "SUMMARY:" + escape(event.getTitleEn()),
                "DESCRIPTION:" + escape(event.getDescriptionEn() == null ? "" : event.getDescriptionEn()),
                "LOCATION:" + escape(event.getVenue().getNameEn()),
                "END:VEVENT",
                "END:VCALENDAR",
                "");
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"expo-echo-" + id + ".ics\"")
                .contentType(new MediaType("text", "calendar"))
                .body(bytes);
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\")
                .replace(",", "\\,")
                .replace(";", "\\;")
                .replace("\n", "\\n");
    }
}
