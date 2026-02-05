FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .

# mvnw executable permission
RUN chmod +x mvnw

# build jar
RUN ./mvnw clean package -DskipTests

# find the jar and rename to app.jar
RUN cp target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
