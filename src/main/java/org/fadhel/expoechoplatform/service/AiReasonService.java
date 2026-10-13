package org.fadhel.expoechoplatform.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.fadhel.expoechoplatform.config.AppProperties;
import org.fadhel.expoechoplatform.domain.Visitor;
import org.fadhel.expoechoplatform.dto.EventCard;
import org.fadhel.expoechoplatform.dto.ReasonPair;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Produces the short "why this matches you" line shown on each card.
 * Uses OpenRouter (Spring AI) when enabled, with a fully deterministic template fallback
 * so the demo never depends on the network.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiReasonService {

    private final ObjectProvider<ChatClient.Builder> chatClientBuilder;
    private final AppProperties props;

    public Map<Long, ReasonPair> enrich(Visitor visitor, List<EventCard> cards, int max) {
        Map<Long, ReasonPair> result = new HashMap<>();
        if (cards.isEmpty()) {
            return result;
        }
        if (!props.getAi().isEnabled()) {
            return result;
        }
        ChatClient client = client();
        if (client == null) {
            return result;
        }
        List<EventCard> top = cards.stream().limit(Math.max(1, max)).toList();
        try {
            String content = client.prompt()
                    .user(buildPrompt(visitor, top))
                    .call()
                    .content();
            return parse(content, top);
        } catch (Exception ex) {
            log.warn("AI reason enrichment failed, using templates: {}", ex.getMessage());
            return result;
        }
    }

    private ChatClient client() {
        ChatClient.Builder builder = chatClientBuilder.getIfAvailable();
        return builder == null ? null : builder.build();
    }

    private String buildPrompt(Visitor visitor, List<EventCard> cards) {
        String interests = visitor.getInterests().stream()
                .map(c -> c.getCode())
                .collect(Collectors.joining(", "));
        if (interests.isBlank()) {
            interests = "general visitor";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("You are Expo Echo, a friendly wayfinding assistant at Expo 2030 Riyadh.\n");
        sb.append("Visitor interests: ").append(interests).append(".\n");
        sb.append("Available time: ").append(visitor.getAvailableMinutes() == null ? "flexible"
                : visitor.getAvailableMinutes() + " minutes").append(".\n\n");
        sb.append("For each event below, write ONE short, warm, concrete reason it fits this visitor.\n");
        sb.append("Mention the category, the walking distance and the minutes until start where helpful. ");
        sb.append("English reason max 16 words, Arabic reason max 14 words. No emojis.\n");
        sb.append("Return exactly one line per event in the format:\n");
        sb.append("ID|English reason|سبب عربي\n\n");
        for (EventCard c : cards) {
            sb.append("ID=").append(c.id())
                    .append(" | category=").append(c.category().nameEn())
                    .append(" | title=").append(c.titleEn())
                    .append(" | distance=").append(c.distanceMeters() == null ? "unknown" : c.distanceMeters() + "m")
                    .append(" | startsIn=").append(c.minutesToStart()).append("min")
                    .append(" | match=").append(c.matchScore()).append("%\n");
        }
        return sb.toString();
    }

    private Map<Long, ReasonPair> parse(String content, List<EventCard> cards) {
        Map<Long, ReasonPair> result = new HashMap<>();
        if (content == null) {
            return result;
        }
        for (String rawLine : content.split("\\r?\\n")) {
            String line = rawLine.trim();
            if (line.isEmpty()) {
                continue;
            }
            String[] parts = line.split("\\|");
            if (parts.length < 3) {
                continue;
            }
            String idPart = parts[0].replaceAll("[^0-9]", "");
            if (idPart.isBlank()) {
                continue;
            }
            try {
                Long id = Long.parseLong(idPart);
                String en = parts[1].trim();
                String ar = parts[2].trim();
                if (!en.isEmpty() || !ar.isEmpty()) {
                    result.put(id, new ReasonPair(en, ar));
                }
            } catch (NumberFormatException ignored) {
                // skip malformed line
            }
        }
        return result;
    }

    public ReasonPair template(EventCard card) {
        String catEn = card.category() == null ? "event" : card.category().nameEn();
        String catAr = card.category() == null ? "الفعالية" : card.category().nameAr();
        int interest = card.breakdown().interest();

        String enLead;
        String arLead;
        if (interest >= 36) {
            enLead = "Strongly matches your interest in " + catEn;
            arLead = "يطابق بشدة اهتمامك بـ" + catAr;
        } else if (interest >= 22) {
            enLead = "Related to your interest in " + catEn;
            arLead = "مرتبط باهتمامك بـ" + catAr;
        } else {
            enLead = "A popular " + catEn + " pick to discover";
            arLead = "خيار " + catAr + " رائج يستحق الاكتشاف";
        }

        StringBuilder en = new StringBuilder(enLead);
        StringBuilder ar = new StringBuilder(arLead);
        Integer distance = card.distanceMeters();
        if (distance != null && distance <= 400) {
            en.append(", just ").append(distance).append(" m away");
            ar.append("، على بعد ").append(distance).append(" متر فقط");
        }
        if (card.minutesToStart() >= 0) {
            en.append(" and starts in ").append(card.minutesToStart()).append(" min.");
            ar.append(" ويبدأ خلال ").append(card.minutesToStart()).append(" دقيقة.");
        } else {
            en.append(".");
            ar.append(".");
        }
        return new ReasonPair(en.toString(), ar.toString());
    }
}
