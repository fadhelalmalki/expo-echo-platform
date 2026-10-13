# ---------- Stage 1: build the Angular frontend ----------
FROM node:24-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: build the Spring Boot backend with the SPA bundled ----------
FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /app
COPY pom.xml ./
COPY .mvn/ .mvn/
COPY mvnw ./
RUN chmod +x mvnw && ./mvnw -q -B -DskipTests dependency:go-offline || true
COPY src ./src
COPY --from=frontend /app/frontend/dist/frontend/browser ./src/main/resources/static
RUN ./mvnw -q -B -DskipTests package

# ---------- Stage 3: lightweight runtime ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:MaxRAMPercentage=75"
COPY --from=backend /app/target/expo-echo-platform-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
