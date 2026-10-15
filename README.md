<div align="center">

<img src="./assets/banner.jpg" alt="Expo Echo" />

#  Expo Echo Platform

**An AI-powered event recommendation engine for Expo 2030 Riyadh.**

Turns an overwhelming event programme into a hyper-personalized, time-aware feed —
scoring every nearby event against the visitor's interests, location and available time.

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?logo=springboot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql&logoColor=white)

</div>

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [How the Match score works](#how-the-match-score-works)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Configuration reference](#configuration-reference)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Testing](#testing)
- [Deployment (Railway)](#deployment-railway)
- [Demo script (90 seconds)](#demo-script-90-seconds)
- [Troubleshooting](#troubleshooting)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

> Digital Challenge **1.3** — *"The difficulty of discovering and selecting suitable events
> when multiple activities are scheduled close together or overlap in time."*

Expo Echo answers one question well: **"What should I do next, given who I am, where I stand, and how much time I have?"**

A visitor sets a few interests and an available time window during onboarding. Expo Echo then:

- **scores** every upcoming event deterministically (interests + distance + timing + availability),
- shows a **Match %**, walking distance, and a live **countdown** for each card,
- adds a short, warm **AI reason** ("*Strongly matches your interest in Technology, 150 m away, starts in 5 min*"),
- lets visitors **confirm attendance** and fires a **browser notification** ~10 minutes before the event starts.

Arabic-first and fully bilingual (AR/RTL ⇄ EN/LTR), with the official Expo 2030 visual identity.

---

## Features

| | |
|---|---|
| 🎯 **Explainable match score** | A deterministic 0–100 score with a per-factor breakdown (see [How the Match score works](#how-the-match-score-works)) |
| 🤖 **AI reasons** | One short reason per card via **OpenRouter** (Spring AI) — with a deterministic template fallback so the demo never depends on the network |
| ⏱️ **Live countdowns** | "starts in 5 min", with an imminent state for events starting soon |
| 🚶 **Distance & walk time** | Haversine distance plus estimated walking minutes from the visitor's position |
| 🗺️ **Simulation map** | Leaflet map of the Expo site; drag the marker to recompute distances and re-rank the list |
| ✅ **Instant booking** | Confirm / cancel attendance with live seat counts |
| 🔔 **Reminders** | Spring `@Scheduled` + **Server-Sent Events** → browser Web Notifications 10 min before start (opt out anytime) |
| 🌐 **Arabic-first bilingual UI** | Full AR (RTL) / EN (LTR) with a runtime language switch |
| 🎨 **Expo 2030 brand** | Official palette, palm-leaf gradients, and language-aware logos |
| 📱 **Responsive** | Mobile-first layout that works on phone and desktop |

---

## How the Match score works

Scoring is deterministic and fully explainable — **AI only enriches the wording, never the number**.
Each event is scored out of 100:

| Signal | Weight | What it measures |
|---|---:|---|
| **Interest match** | 40 | Exact category match, or weighted tag overlap with the visitor's interests |
| **Proximity** | 25 | Distance relative to the search radius, with a distance-decay curve |
| **Timing** | 20 | Whether the event fits the available time window (and how soon it starts) |
| 🪑 Availability | 10 | Remaining seats relative to capacity |
| 🔥 Popularity | 5 | Pre-seeded event popularity |

**Ranking:** only events that start within the visitor's time window **and** fall inside the selected
radius are returned, sorted by match score. If fewer than 6 events qualify, the search is
automatically relaxed (larger radius, wider window) so the feed is never sparse.

**AI layer:** the top results are enriched with bilingual reasons through OpenRouter (`AiReasonService`).
If AI is disabled or the call fails, a deterministic Arabic/English template is used instead.
The AI **never** touches the score itself.

---

## Architecture

A **single deployable unit** — Spring Boot serves the compiled Angular SPA, so there is one URL and no CORS.

```
Browser (Angular SPA)
   │  HTTP (REST)                                    ┌──────────────────────┐
   ├───────────────▶ Spring Boot (port 8080) ───────▶│ H2 (dev)             │
   │                     ├─ ScoringService           │ PostgreSQL (prod)    │
   │                     ├─ RecommendationService    └──────────────────────┘
   │                     ├─ AiReasonService ────────▶ OpenRouter (optional)
   └──── SSE ────────────┴─ ReminderScheduler ──▶ Web Notifications
```

| Layer | Responsibility |
|---|---|
| `web` | REST controllers + global exception handler |
| `service` | Scoring, recommendation ranking, booking, AI reasons, notifications (SSE) |
| `scheduling` | `ReminderScheduler` — dispatches due reminders every 30 s |
| `repository` | Spring Data JPA |
| `domain` | Event, Category, Venue, Visitor, Booking, AppNotification |
| `config` | Security, SPA fallback, `AppProperties`, `DataSeeder` |

---

## Tech stack

| Area | Technology |
|---|---|
| **Backend** | Java 21 · Spring Boot 4.1 · Spring Web MVC · Spring Data JPA · Spring Security · Spring Actuator |
| **AI** | Spring AI 2.0 (OpenAI-compatible client → **OpenRouter**) |
| **Database** | H2 in-memory (dev/test) · PostgreSQL (prod) |
| **Frontend** | Angular 21 (standalone components, signals, zoneless) · TypeScript 5.9 · Tailwind CSS 4 · Leaflet 1.9 |
| **Testing** | JUnit 5 / Spring Boot Test (backend) · Vitest 4 (frontend) |
| **Build & deploy** | Maven Wrapper · multi-stage Dockerfile · Railway |

---

## Getting started

### Prerequisites

| Tool | Version |
|---|---|
| JDK | 21+ |
| Node.js | 20.19+, 22.12+, or 24+ |
| npm | 11+ (bundled with Node) |
| OpenRouter API key | *optional* — only needed for AI reasons |

### 1. Clone

```bash
git clone https://github.com/fadhelalmalki/expo-echo-platform.git
cd expo-echo-platform
```

### 2. Run the backend (dev profile → in-memory H2 + seeded demo data)

> ⚠️ **Important:** the default Spring profile is `prod`. Always set the profile explicitly when
> running locally, or the app will try to reach PostgreSQL on `localhost:5432`.

```bash
# macOS / Linux / Git Bash
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run

# Windows PowerShell
$env:SPRING_PROFILES_ACTIVE="dev"; ./mvnw.cmd spring-boot:run

# Windows CMD
set SPRING_PROFILES_ACTIVE=dev && mvnw.cmd spring-boot:run
```

The API is now on <http://localhost:8080> (H2 console at <http://localhost:8080/h2-console>, JDBC URL `jdbc:h2:mem:expoecho`).

### 3. Run the frontend (port 4200, proxies `/api` → 8080)

```bash
cd frontend
npm install
npm start
```

Open **<http://localhost:4200>**. It starts in Arabic (RTL) — switch to English from the header.

### 4. Optional — full production build

The backend does not bundle the frontend during a plain Maven build; the compiled SPA is copied in
during packaging (exactly what the `Dockerfile` does):

```bash
cd frontend && npm ci && npm run build && cd ..
# copy the compiled SPA into the backend's static resources, then package
cp -r frontend/dist/frontend/browser/. src/main/resources/static/
./mvnw -DskipTests package
java -jar target/expo-echo-platform-0.0.1-SNAPSHOT.jar
```

Or use Docker directly:

```bash
docker build -t expo-echo .
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev expo-echo
```

---

## Configuration reference

All application settings live under the `app.*` prefix (`AppProperties`) and can be overridden by
environment variables in `application.yml`.

| Property | Env var | Default | Description |
|---|---|---|---|
| `app.ai.enabled` | `AI_ENABLED` | `true` | Enable AI-generated reasons (requires a valid `OPENROUTER_API_KEY`) |
| `app.seed.enabled` | – | `true` | Seed demo categories / venues / events on startup |
| `app.site.center-lat` | `SITE_CENTER_LAT` | `24.878738040594087` | Simulated Expo site center (latitude) |
| `app.site.center-lng` | `SITE_CENTER_LNG` | `46.70069308320736` | Simulated Expo site center (longitude) |
| `app.recommendation.default-radius-meters` | – | `600` | Default search radius |
| `app.recommendation.max-radius-meters` | – | `3000` | Maximum allowed radius |
| `app.recommendation.walk-speed-meters-per-minute` | – | `80` | Walking speed used for walk-time estimates |
| `app.recommendation.reminder-lead-minutes` | – | `10` | Minutes before start to send a reminder |

---

## Environment variables

Copy `.env.example` to `.env` for reference.

> ℹ️ Spring Boot **does not load `.env` files**. Export these in your shell, pass them with
> `-e` in Docker, or set them in your host's dashboard (e.g. Railway). A `.env` file is
> documentation only unless your shell/platform loads it.

| Variable | Default | Description |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | `dev` (H2) or `prod` (PostgreSQL). Set `dev`/`test` locally. |
| `OPENROUTER_API_KEY` | `unset` | OpenRouter key — [openrouter.ai/keys](https://openrouter.ai/keys) |
| `OPENROUTER_MODEL` | `openai/gpt-4o-mini` | Any OpenRouter model id |
| `AI_ENABLED` | `true` | Set `false` to skip AI calls entirely and always use templates |
| `SITE_CENTER_LAT` / `SITE_CENTER_LNG` | Expo site center | Location the demo data is seeded around |
| `PORT` | `8080` | HTTP port |
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | – | Provided automatically by the Railway PostgreSQL plugin |
| `SPRING_DATASOURCE_URL` | derived from the `PG*` vars | Full JDBC URL override |

> `.env` is **not** read by Spring Boot. Export variables in your shell, or set them on your host.

---

## API reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/categories` | Expo theme categories (with brand gradients) |
| `GET` | `/api/config` | Site center, radii, walk speed, reminder lead, AI flag |
| `POST` | `/api/visitors` | Create a visitor `{ displayName, interestCodes[], availableMinutes, latitude, longitude }` |
| `GET` | `/api/visitors/{id}` | Fetch a visitor |
| `PUT` | `/api/visitors/{id}` | Update interests / time / location |
| `GET` | `/api/recommendations?visitorId=&minutes=&radius=&limit=` | Personalized scored event cards (`limit` default 20, max 50) |
| `GET` | `/api/events?within=` | Upcoming events (`within` = minutes, default 240, max 2880) |
| `GET` | `/api/events/{id}` | Single event detail |
| `POST` | `/api/bookings` | Confirm attendance `{ visitorId, eventId }` |
| `DELETE` | `/api/bookings?visitorId=&eventId=` | Cancel attendance |
| `GET` | `/api/bookings?visitorId=` | List a visitor's bookings |
| `GET` | `/api/notifications?visitorId=` | Reminder history |
| `GET` | `/api/notifications/stream?visitorId=` | **SSE** stream of live reminders |
| `GET` | `/actuator/health` | Health probe |

<details>
<summary><b>Quick example</b></summary>

```bash
# Create a visitor
curl -X POST http://localhost:8080/api/visitors \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Sara","interestCodes":["TECHNOLOGY","ART"],"availableMinutes":30}'

# Score events for that visitor
curl "http://localhost:8080/api/recommendations?visitorId=<id>&minutes=30&radius=600"
```

</details>

---

## Testing

```bash
# Backend — uses the `test` profile so it never touches PostgreSQL
SPRING_PROFILES_ACTIVE=test ./mvnw test

# Frontend — CI=true runs once instead of starting watch mode
cd frontend && CI=true npm test
```

> The `test` profile has no `application-test.yml`; without a configured datasource Spring Boot
> auto-configures the embedded **H2** from the classpath, keeping tests fast and self-contained.

---

## Deployment (Railway)

1. **Push** the repository to GitHub.
2. **Create a Railway project** from the repo — it builds via the multi-stage [`Dockerfile`](./Dockerfile) (`node build → maven build → JRE run`).
3. **Add PostgreSQL** (New → Database → PostgreSQL). Railway injects `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`.
4. **Set service variables**:
   ```
   SPRING_PROFILES_ACTIVE=prod
   AI_ENABLED=true
   OPENROUTER_API_KEY=<your key>
   OPENROUTER_MODEL=openai/gpt-4o-mini
   ```
5. **Generate a public domain** (Settings → Networking → Generate Domain).
6. Open `https://<your-domain>/` — health check is `GET /actuator/health` (see [`railway.json`](./railway.json)).

---

## Demo script (90 seconds)

1. Open the app URL on your phone → it starts in **Arabic (RTL)**.
2. **Onboarding**: enter a name, tap **Technology + Art**, choose **30 minutes**, then **Enable notifications** (or **Not now** to skip) → *Start exploring*.
3. The feed shows a card with a high **Match %** — e.g. *"starts in 5 min · 150 m away"* — plus an AI line like *"Strongly matches your interest in Technology, just 150 m away and starts in 5 min."*
4. Tap **Confirm attendance** → toast + live seat count.
5. Open the **Map**, drag your marker → distances update and the list re-ranks.
6. Wait a few seconds → the **reminder notification** fires (scheduler + SSE + Web Notification).
7. Toggle **AR/EN** in the header to show RTL ⇄ LTR and the swapped logo.

---

## Project structure

```
expo-echo-platform/
├─ assets/                         Banner & documentation media
├─ frontend/                       Angular 21 SPA
│  ├─ public/                      Static assets served as-is (logos)
│  └─ src/app/
│     ├─ core/       API, state, i18n, toasts
│     ├─ shared/     Cards, match ring, countdown, formatting, brand
│     ├─ layout/     App shell + navigation
│     └─ features/   onboarding · feed · map · bookings · profile · event-detail
├─ src/main/java/org/fadhel/expoechoplatform/
│  ├─ domain/  repository/  service/  scheduling/  web/  config/  dto/  util/
├─ src/main/resources/            application.yml + dev/prod profiles
├─ Dockerfile                     multi-stage build
└─ railway.json                   healthcheck / deploy config
```
