# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Copy file pom và mã nguồn
COPY pom.xml .
COPY src ./src

# Build ứng dụng (bỏ qua chạy test để build nhanh hơn)
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# (Cấu hình môi trường sẽ được nạp trực tiếp trên Render)
# Copy file chạy .jar từ build stage
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
