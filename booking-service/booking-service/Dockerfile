
FROM maven:3.8.8-eclipse-temurin-17 AS build

WORKDIR /app

COPY booking-service/booking-service/pom.xml .
COPY booking-service/booking-service/mvnw .
COPY booking-service/booking-service/.mvn .mvn
COPY booking-service/booking-service/src ./src

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]

