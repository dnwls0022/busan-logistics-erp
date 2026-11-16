<div align="center">

# 📦 부산 광역 물류 ERP 시스템
<p><b>Busan Logistics ERP Service</b></p>

[![Java 17](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

</div>

---

## 💡 프로젝트 소개
> 창고 재고 관리, 실시간 주문·배송 추적, 카카오맵 API 기반 물류 거점 시각화를 제공하는 **통합 풀스택 물류 ERP 웹 서비스**입니다.  
> 복잡한 물류 흐름을 데이터화하고 직관적인 UI로 제어할 수 있도록 설계되었습니다.

---

## 🖼️ 서비스 화면 미리보기
*(※ 실행 화면 스크린샷이나 시연 이미지를 아래 경로에 추가해 보세요)*

> ![Service Preview Placeholder](https://via.placeholder.com/900x450/1e1e2f/ffffff?text=Busan+Logistics+ERP+Screenshot)

---

## 🛠️ Tech Stack

### Frontend
* <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"> <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=TailwindCSS&logoColor=white"> <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=Vite&logoColor=white">

### Backend & Database
* <img src="https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white"> <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white"> <img src="https://img.shields.io/badge/MariaDB-003545?style=flat-square&logo=mariadb&logoColor=white">

### Infra & Deployment
* <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white"> <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white"> <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white">

---

## ✨ Key Features

* **📦 재고 및 입출고 관리**
  * 창고별 실시간 물품 재고 현황 파악 및 입출고 내역 전산화 프로세스 구축
* **🚚 주문 및 배송 관리**
  * 주문 등록부터 배송 일정 조율까지의 물류 흐름 통합 관리
* **🗺️ 카카오맵 API 연동**
  * 물류 거점 및 배송 경로 시각화 (위치 정보 기반 인터랙티브 UI 제공)
* **🔒 관리자 권한 제어 및 보안**
  * 역할별 접근 제어 및 백엔드 인중/인가 기능 구현

---

## 📁 Architecture & Structure

```text
busan-logistics-erp/
├── frontend/          # React, TypeScript 프론트엔드
├── src/               # Java 17, Spring Boot 백엔드 로직
├── Dockerfile         # 컨테이너 패키징 설정
└── build.gradle       # 빌드 및 의존성 관리
