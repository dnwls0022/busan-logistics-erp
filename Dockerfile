# 1단계: 자바 환경을 만들고 프로그램을 빌드(요리)합니다.
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2단계: 완성된 요리(jar 파일)를 손님에게 제공할 준비를 합니다.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]