# 1단계: 자바 및 Node.js 빌드 환경 (Debian 기반으로 호환성 확보)
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Node.js 및 npm 설치
RUN apt-get update && apt-get install -y nodejs npm

COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2단계: 최종 실행 환경 (가벼운 Alpine 유지를 위해 JRE Alpine 사용)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]