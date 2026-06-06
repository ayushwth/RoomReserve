FROM maven:3.8.8-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml ./
COPY mvnw ./
COPY .mvn .mvn
COPY src ./src

RUN chmod +x mvnw
RUN ./mvnw -B -DskipTests package
FROM eclipse-temurin:17-jre

WORKDIR /app

ENV JAVA_OPTS=""

# create a non-root user for running the app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/target/*.jar app.jar

# install a small HTTP client for healthchecks, then set ownership
RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl \
	&& rm -rf /var/lib/apt/lists/* \
	&& chown appuser:appgroup app.jar

# switch to non-root user
USER appuser

EXPOSE 8080

# lightweight healthcheck (will return non-zero if service unavailable)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -f http://localhost:8080/ || exit 1

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]