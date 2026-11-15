# 📦 부산 물류 ERP (Busan Logistics ERP)

> 창고 재고 관리, 주문 처리, 배송 일정 조율 및 카카오맵 API 연동 기능 등을 제공하는 통합 풀스택 물류 ERP 웹 서비스입니다.

---

## 🛠️ Tech Stack

### Frontend
* **React**, **TypeScript**, **Tailwind CSS**, **Vite**

### Backend
* **Java 17**, **Spring Boot 3.2**, **Gradle**

### Database & Infra
* **MariaDB / MySQL** (HeidiSQL)
* **Docker**, **GCP**, **Vercel**

---

## ✨ Key Features

1. **재고 및 입출고 관리**
   * 창고별 실시간 물품 재고 현황 파악 및 입출고 내역 전산화
2. **주문 및 배송 관리**
   * 주문 등록부터 배송 일정 조율까지의 물류 흐름 통합 관리
3. **카카오맵 API 연동**
   * 물류 거점 및 배송 경로 시각화 (지도 로드뷰 및 위치 정보 확인)
4. **커뮤니티 및 관리자 권한 제어**
   * 사내 소통을 위한 공지/게시판 기능 및 관리자 전용 접근 제어

---

## 📁 Project Structure

```text
busan-logistics-erp/
├── frontend/          # React 프론트엔드 소스 코드
├── gradle/            # Gradle 빌드 관련 설정
├── src/               # Spring Boot 백엔드 소스 코드
├── Dockerfile         # Docker 컨테이너 설정
├── build.gradle       # 백엔드 의존성 및 빌드 설정
└── package.json       # 프론트엔드 패키지 및 의존성 관리
