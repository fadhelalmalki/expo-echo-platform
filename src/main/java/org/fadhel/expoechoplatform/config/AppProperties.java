package org.fadhel.expoechoplatform.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private Ai ai = new Ai();
    private Site site = new Site();
    private Recommendation recommendation = new Recommendation();
    private Seed seed = new Seed();

    @Getter
    @Setter
    public static class Ai {
        private boolean enabled = false;
    }

    @Getter
    @Setter
    public static class Site {
        private double centerLat = 24.7690;
        private double centerLng = 46.6580;
    }

    @Getter
    @Setter
    public static class Recommendation {
        private int defaultRadiusMeters = 600;
        private int maxRadiusMeters = 3000;
        private int walkSpeedMetersPerMinute = 80;
        private int reminderLeadMinutes = 10;
    }

    @Getter
    @Setter
    public static class Seed {
        private boolean enabled = true;
    }
}
