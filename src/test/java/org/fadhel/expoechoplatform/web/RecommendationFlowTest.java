package org.fadhel.expoechoplatform.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RecommendationFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void visitorCanGetRecommendationsAndBook() throws Exception {
        String visitorJson = """
                {
                  "displayName": "Integration Tester",
                  "interestCodes": ["TECHNOLOGY", "ART"],
                  "availableMinutes": 60,
                  "latitude": 24.7690,
                  "longitude": 46.6580
                }
                """;

        String created = mockMvc.perform(post("/api/visitors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(visitorJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andReturn().getResponse().getContentAsString();

        String visitorId = created.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");

        String recommendations = mockMvc.perform(get("/api/recommendations")
                        .param("visitorId", visitorId)
                        .param("minutes", "120")
                        .param("radius", "3000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cards").isArray())
                .andExpect(jsonPath("$.cards[0].matchScore").exists())
                .andExpect(jsonPath("$.cards[0].aiReasonEn").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        String eventId = recommendations.replaceAll(".*?\"cards\":\\s*\\[\\s*\\{.*?\"id\":(\\d+).*", "$1");

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"visitorId\":\"" + visitorId + "\",\"eventId\":" + eventId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        mockMvc.perform(get("/api/notifications").param("visitorId", visitorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].messageEn").isNotEmpty());
    }

    @Test
    void unknownApiRouteReturns404() throws Exception {
        mockMvc.perform(get("/api/does-not-exist")).andExpect(status().isNotFound());
    }
}
