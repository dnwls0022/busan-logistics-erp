# 1단계: 자바 21 및 Node.js 빌드 환경 (Java 21 버전으로 변경)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Node.js 및 npm 설치
RUN apt-get update && apt-get install -y nodejs npm

COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2단계: 최종 실행 환경 (Java 21 JRE Alpine 사용)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]