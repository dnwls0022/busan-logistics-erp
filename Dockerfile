# 1단계: 자바 및 Node.js(프론트엔드 빌드용) 환경 설정
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# 프론트엔드 빌드에 필요한 Node.js 및 npm 설치
RUN apk add --no-cache nodejs npm

COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2단계: 실행 환경 설정
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]