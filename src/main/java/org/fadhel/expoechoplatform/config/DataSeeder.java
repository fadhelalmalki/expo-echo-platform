package org.fadhel.expoechoplatform.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.fadhel.expoechoplatform.domain.Category;
import org.fadhel.expoechoplatform.domain.Event;
import org.fadhel.expoechoplatform.domain.Venue;
import org.fadhel.expoechoplatform.repository.CategoryRepository;
import org.fadhel.expoechoplatform.repository.EventRepository;
import org.fadhel.expoechoplatform.repository.VenueRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final AppProperties props;

    private static final double EARTH_LAT_METERS = 111_320d;

    @Override
    @Transactional
    public void run(String... args) {
        if (!props.getSeed().isEnabled()) {
            log.info("Seeding disabled");
            return;
        }
        if (categoryRepository.count() == 0) {
            seedCategories();
        }
        List<Venue> venues = venueRepository.count() == 0 ? seedVenues() : venueRepository.findAll();
        if (eventRepository.count() == 0) {
            seedEvents(venues);
        }
        ensureRollingEvents();
        log.info("Seed complete: {} categories, {} venues, {} events",
                categoryRepository.count(), venueRepository.count(), eventRepository.count());
    }

    private void seedCategories() {
        categoryRepository.saveAll(List.of(
                Category.builder().code("NATURE").nameEn("Nature").nameAr("الطبيعة")
                        .colorStart("#006C35").colorEnd("#4FB480").icon("leaf").build(),
                Category.builder().code("ART").nameEn("Art").nameAr("الفن")
                        .colorStart("#FAB712").colorEnd("#FFEE9B").icon("palette").build(),
                Category.builder().code("ARCHITECTURE").nameEn("Architecture").nameAr("العمارة")
                        .colorStart("#1E87BD").colorEnd("#4FB480").icon("building").build(),
                Category.builder().code("TECHNOLOGY").nameEn("Technology").nameAr("التقنية")
                        .colorStart("#47266C").colorEnd("#95629E").icon("cpu").build(),
                Category.builder().code("SCIENCE").nameEn("Science").nameAr("العلوم")
                        .colorStart("#08B0A0").colorEnd("#8BCAB3").icon("flask").build(),
                Category.builder().code("TRADITION").nameEn("Tradition").nameAr("التراث")
                        .colorStart("#E8431B").colorEnd("#F1881D").icon("lantern").build()
        ));
    }

    private List<Venue> seedVenues() {
        record V(String en, String ar, String area) {}
        List<V> defs = List.of(
                new V("Al Wasl Plaza", "ساحة الوصل", "AL_WASL"),
                new V("Sustainability Pavilion", "جناح الاستدامة", "SUSTAINABILITY"),
                new V("Mobility Pavilion", "جناح التنقل", "MOBILITY"),
                new V("Opportunity Pavilion", "جناح الفرص", "OPPORTUNITY"),
                new V("Innovation X Hub", "مركز الابتكار", "INNOVATION"),
                new V("Saudi Pavilion", "الجناح السعودي", "SAUDI"),
                new V("Technology Dome", "قبة التقنية", "TECH"),
                new V("Arts District", "حي الفنون", "ARTS"),
                new V("Science Oasis", "واحة العلوم", "SCIENCE"),
                new V("Heritage Village", "قرية التراث", "HERITAGE"),
                new V("Green Zone", "المنطقة الخضراء", "GREEN"),
                new V("World Stage", "المسرح العالمي", "WORLD")
        );
        int[] dx = {0, 180, -220, 260, -300, 90, -140, 320, -360, 150, 400, -60};
        int[] dy = {0, 140, -190, -120, 230, -60, 300, 90, -260, -320, 60, 380};
        double lat0 = props.getSite().getCenterLat();
        double lng0 = props.getSite().getCenterLng();
        List<Venue> venues = new ArrayList<>();
        for (int i = 0; i < defs.size(); i++) {
            venues.add(Venue.builder()
                    .nameEn(defs.get(i).en())
                    .nameAr(defs.get(i).ar())
                    .areaCode(defs.get(i).area())
                    .latitude(lat0 + dx[i] / EARTH_LAT_METERS)
                    .longitude(lng0 + dy[i] / (EARTH_LAT_METERS * Math.cos(Math.toRadians(lat0))))
                    .build());
        }
        return venueRepository.saveAll(venues);
    }

    private void seedEvents(List<Venue> venues) {
        LocalDateTime base = LocalDateTime.now().withSecond(0).withNano(0);
        List<Event> events = new ArrayList<>();

        events.add(ev("Live AI Showcase: Generative Futures", "عرض الذكاء الاصطناعي: مستقبلات توليدية",
                "Watch generative AI create art and music live, then meet the builders.",
                "شاهد الذكاء الاصطناعي وهو يبتكر الفن والموسيقى مباشرة والتقِ بالمطورين.",
                "TECHNOLOGY", venues.get(6), base.plusMinutes(3), 30, 120, "en", "ai,generative,robotics", 88));
        events.add(ev("Arabic Calligraphy & Typography Lab", "مختبر الخط العربي", 
                "Hands-on session on modern Arabic typography and digital calligraphy.",
                "جلسة تطبيقية في الطباعة العربية الحديثة والخط الرقمي.",
                "ART", venues.get(7), base.plusMinutes(5), 45, 40, "ar", "arabic,design,calligraphy", 80));
        events.add(ev("Sustainable Cities Talk", "حديث المدن المستدامة",
                "Experts on the future of net-zero cities in the region.",
                "خبراء يتحدثون عن مستقبل المدن المحايدة كربونياً.",
                "NATURE", venues.get(1), base.plusMinutes(8), 40, 200, "en", "climate,green,cities", 75));
        events.add(ev("Robot Football Arena", "ساحة كرة القدم للروبوتات",
                "Autonomous robots compete in a fast-paced match.",
                "روبوتات ذاتية تتنافس في مباراة سريعة.",
                "TECHNOLOGY", venues.get(6), base.plusMinutes(12), 20, 150, "en", "robotics,ai", 90));
        events.add(ev("Journey Through Saudi Heritage", "رحلة في التراث السعودي",
                "An immersive walkthrough of Saudi traditions and crafts.",
                "جولة غامرة في العادات والحرف السعودية.",
                "TRADITION", venues.get(9), base.plusMinutes(15), 35, 180, "ar", "heritage,culture", 70));
        events.add(ev("Quantum Computing Explained", "شرح الحوسبة الكمية",
                "A beginner-friendly intro to quantum bits and algorithms.",
                "مقدمة مبسطة للبت الكمي والخوارزميات.",
                "SCIENCE", venues.get(8), base.plusMinutes(20), 45, 100, "en", "quantum,science", 65));
        events.add(ev("Desert Farming Innovation", "ابتكارات الزراعة الصحراوية",
                "How tech is greening the desert and saving water.",
                "كيف تُخضّر التقنية الصحراء وتوفر المياه.",
                "NATURE", venues.get(10), base.plusMinutes(25), 30, 90, "en", "agriculture,water", 60));
        events.add(ev("Future of Mobility Panel", "جلسة مستقبل التنقل",
                "From hyperloop to autonomous flight: what is next.",
                "من الهايبرلوب إلى الطيران الذاتي: ما التالي.",
                "ARCHITECTURE", venues.get(2), base.plusMinutes(35), 50, 220, "en", "mobility,transport", 72));
        events.add(ev("Interactive Light Installation", "التنصيب الضوئي التفاعلي",
                "A responsive light show reacting to crowd movement.",
                "عرض ضوئي يتفاعل مع حركة الجمهور.",
                "ART", venues.get(7), base.plusMinutes(45), 25, 300, "ar", "light,immersive", 68));
        events.add(ev("Startup Pitch Battle", "معركة العروض الريادية",
                "Twelve startups compete for the innovation prize.",
                "اثنتا عشرة شركة ناشئة تتنافس على جائزة الابتكار.",
                "TECHNOLOGY", venues.get(4), base.plusMinutes(60), 60, 250, "en", "startup,investment", 78));
        events.add(ev("Astronomy Night: Riyadh Skies", "ليلة الفلك: سماء الرياض",
                "Guided stargazing with telescopes and astronomers.",
                "مراقبة النجوم بالتلسكوب مع علماء فلك.",
                "SCIENCE", venues.get(8), base.plusMinutes(75), 60, 120, "en", "space,astronomy", 66));
        events.add(ev("Traditional Music Ensemble", "فرقة الموسيقى التقليدية",
                "Live performance of regional folk music.",
                "عزف حي للموسيقى الشعبية الإقليمية.",
                "TRADITION", venues.get(11), base.plusMinutes(90), 45, 400, "ar", "music,live", 74));
        events.add(ev("Smart Grid Demonstration", "عرض الشبكة الذكية",
                "See how the Expo runs on renewable micro-grids.",
                "شاهد كيف يعمل إكسبو على شبكات متجددة دقيقة.",
                "ARCHITECTURE", venues.get(1), base.plusMinutes(110), 40, 100, "en", "energy,smart", 58));
        events.add(ev("AI in Healthcare Workshop", "ورشة الذكاء الاصطناعي في الصحة",
                "Diagnostics, wearables and personalized medicine.",
                "التشخيص والأجهزة القابلة لللبس والطب الشخصي.",
                "TECHNOLOGY", venues.get(6), base.plusMinutes(130), 50, 80, "en", "ai,health", 70));
        events.add(ev("Coral Reefs & Oceans", "الشعاب المرجانية والمحيطات",
                "Marine conservation and blue economy discussion.",
                "نقاش حول حفظ البحار والاقتصاد الأزرق.",
                "NATURE", venues.get(1), base.plusMinutes(150), 40, 130, "en", "ocean,climate", 55));
        events.add(ev("Night of Poetry", "ليلة الشعر",
                "Contemporary Arabic poetry reading.",
                "قراءة شعرية عربية معاصرة.",
                "ART", venues.get(7), base.plusMinutes(170), 60, 150, "ar", "poetry,literature", 62));
        events.add(ev("Hydrogen Economy Summit", "قمة اقتصاد الهيدروجين",
                "The role of green hydrogen in the energy transition.",
                "دور الهيدروجين الأخضر في انتقال الطاقة.",
                "SCIENCE", venues.get(10), base.plusMinutes(200), 55, 200, "en", "energy,hydrogen", 64));
        events.add(ev("Saudi Vision 2030 Talk", "حديث رؤية السعودية 2030",
                "Progress and opportunities across the Kingdom.",
                "التقدم والفرص في أنحاء المملكة.",
                "ARCHITECTURE", venues.get(5), base.plusMinutes(240), 45, 300, "ar", "vision,saudi", 82));
        events.add(ev("Gaming & Esports Zone Finals", "نهائيات منطقة الألعاب",
                "Regional esports final with live commentary.",
                "نهائي الرياضات الإلكترونية مع تعليق مباشر.",
                "TECHNOLOGY", venues.get(4), base.plusMinutes(280), 90, 500, "en", "gaming,esports", 85));
        events.add(ev("Bee & Pollination Garden", "حديقة النحل والتلقيح",
                "Family activity on pollinators and biodiversity.",
                "نشاط عائلي حول الملقحات والتنوع الحيوي.",
                "NATURE", venues.get(10), base.plusMinutes(320), 40, 60, "ar", "nature,family", 50));

        eventRepository.saveAll(events);
    }

    /**
     * Keeps the live demo alive: if too few events start within the next 20 minutes,
     * generate fresh ones starting a few minutes from now.
     */
    @Scheduled(fixedRate = 60_000, initialDelay = 90_000)
    @Transactional
    public void ensureRollingEvents() {
        if (!props.getSeed().isEnabled()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
        List<Event> soon = eventRepository.findByStartAtBetweenOrderByStartAtAsc(now, now.plusMinutes(20));
        if (soon.size() >= 4) {
            return;
        }
        List<Venue> venues = venueRepository.findAll();
        if (venues.isEmpty()) {
            return;
        }
        List<Event> fresh = new ArrayList<>();
        String[] cats = {"TECHNOLOGY", "ART", "NATURE", "SCIENCE", "TRADITION", "ARCHITECTURE"};
        int[] offsets = {3, 6, 9, 12, 15};
        for (int i = 0; i < offsets.length; i++) {
            String code = cats[(int) (Math.random() * cats.length)];
            Category category = categoryRepository.findByCode(code).orElse(null);
            if (category == null) {
                continue;
            }
            Venue venue = venues.get((int) (Math.random() * venues.size()));
            fresh.add(Event.builder()
                    .titleEn("Pop-up Session: " + category.getNameEn())
                    .titleAr("جلسة مفاجئة: " + category.getNameAr())
                    .descriptionEn("A surprise session near you. Walk over and join in.")
                    .descriptionAr("جلسة مفاجئة بالقرب منك. تعال وشارك.")
                    .category(category)
                    .venue(venue)
                    .startAt(now.plusMinutes(offsets[i]))
                    .endAt(now.plusMinutes(offsets[i] + 30))
                    .capacity(60)
                    .bookedCount(0)
                    .language(Math.random() > 0.5 ? "en" : "ar")
                    .tags("popup," + code.toLowerCase())
                    .popularity(65)
                    .build());
        }
        eventRepository.saveAll(fresh);
        log.info("Generated {} rolling demo events", fresh.size());
    }

    private Event ev(String titleEn, String titleAr, String descEn, String descAr,
                     String categoryCode, Venue venue, LocalDateTime start, int minutes,
                     int capacity, String language, String tags, int popularity) {
        Category category = categoryRepository.findByCode(categoryCode).orElseThrow();
        return Event.builder()
                .titleEn(titleEn).titleAr(titleAr)
                .descriptionEn(descEn).descriptionAr(descAr)
                .category(category).venue(venue)
                .startAt(start).endAt(start.plusMinutes(minutes))
                .capacity(capacity).bookedCount((int) (capacity * (0.2 + Math.random() * 0.5)))
                .language(language).tags(tags).popularity(popularity)
                .build();
    }
}
