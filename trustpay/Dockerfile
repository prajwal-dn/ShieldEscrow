# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stage 1 — Build  (Maven + JDK 17)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper + POM first (layer-caches dependencies)
COPY .mvn/         .mvn/
COPY mvnw          mvnw
COPY mvnw.cmd      mvnw.cmd
COPY pom.xml       pom.xml

RUN chmod +x ./mvnw

# Download all dependencies offline (cached layer — only changes if pom.xml changes)
RUN ./mvnw dependency:go-offline -q

# Copy the actual source code
COPY src/ src/

# Compile and package, skip tests in image build
RUN ./mvnw clean package -DskipTests -q

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stage 2 — Run  (Lean JRE 17)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FROM eclipse-temurin:17-jre-alpine AS runtime

# Non-root user for security
RUN addgroup -S shield && adduser -S shield -G shield
USER shield

WORKDIR /app

# Copy only the fat JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# JVM tuning for containers: respect Docker CPU/RAM limits
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
