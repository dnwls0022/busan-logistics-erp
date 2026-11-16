<div align="center">

# ☕ 부산 디저트 카페 통합 물류 ERP (CAFE LOGISTICS ERP)
<p><b>지점별 실시간 재고 관리부터 SCM 입출고 승인, 카카오맵 거점 로드뷰, 계정 관리 시스템까지 아우르는 통합 물류 웹 플랫폼</b></p>

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://busan-logistics-erp-rbq5.vercel.app/)

<br/>

![Java 17](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=flat-square&logo=mariadb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

---

## 💡 프로젝트 개요
> 전국 26개 디저트 카페 지점의 원두 및 베이커리 재고를 실시간으로 추적하고, 본사와 가맹점 간의 입출고 요청·승인 및 배송 일정을 통합 관리하는 풀스택 물류 ERP 시스템입니다.  
> 실무 ERP 및 자산 관리 경험을 바탕으로 **안전재고 임계치 알림**, **가용 예산 기반 발주 정산**, **입출고 승인 워크플로우**, **회원가입 및 계정 찾기 인증 시스템**을 직관적인 UI로 구현했습니다.

---

## 🖥️ 주요 화면 및 핵심 기능

### 1. 통합 재고 대시보드 & 가용 예산 발주 시스템
* **실시간 재고 집계 및 안전재고 경고:** 출고 가능 총 재고와 지점별 보유고를 실시간 조회하며, 안전재고(60개 이하) 미만 품목에 대해 **긴급 발주 필요** 배지 및 상단 알림을 제공합니다.
* **가용 예산 연동 발주 계산기 (CAFE INTEGRATED BILL):** 가용 예산을 설정하면 장바구니에 담은 품목의 총 예상 소요 비용과 잔액을 자동 계산하여 본사 발주 신청까지 원스톱으로 처리합니다.

**[대시보드 상단 - 재고 현황]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/019f4864-0265-4c9e-9c78-8050cecbab81" width="100%" />
</div>

**[대시보드 중단 - 지점별 품목]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/f4cfc02e-3a8f-4c5e-ba36-3d98369063ab" width="100%" />
</div>

**[대시보드 하단 - 예산 정산 및 발주]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/b8d32ad2-ca84-4ab3-bbdf-307692ecc66a" width="100%" />
</div>

---

### 2. 카카오맵 API 기반 지점 지도 & 로드뷰 연동
* **거점 위치 및 운영 상태 시각화:** 부산 주요 가맹점(서면, 광안리, 해운대, 남포동 등)의 정상 영업·혼잡·점검 상태를 필터링하고 지도 마커 및 경로와 연동합니다.
* **실시간 거리뷰(RoadView) & 정보 수정 모달:** 선택한 지점의 주변 도로 환경을 로드뷰로 즉시 확인하며, 지점명 및 도로명 주소를 모달 창에서 실시간으로 수정·관리할 수 있습니다.

**[지점 지도 및 로드뷰 기본]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/5834bffe-e0a6-450b-b4be-9677c055006f" width="100%" />
</div>

**[지점 정보 수정 모달]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/b84c137f-7a13-4388-9756-ad741fe0ddb8" width="100%" />
</div>

**[지점 필터 및 경로 조회]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/1c2b3e68-a8e0-4330-9866-2436df61369c" width="100%" />
</div>

---

### 3. 실시간 입출고 SCM 관리 & 배송 스케줄 캘린더
* **입출고 히스토리 추적 및 승인 프로세스 (관리자 전용):** 지점별 입고·출고 요청 내역을 필터링하고, 관리자가 대기 중인 요청을 즉시 **승인**하거나 **반려**하여 데이터 정합성을 유지합니다.
* **물류 배송 일정 캘린더:** 월별 캘린더를 통해 날짜별 배송 차량 배차 현황 및 지점 휴무일·방역일 등 특이사항을 등록·수정합니다.

**[실시간 입출고 및 SCM 공급망 관리]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/69dddd7d-e730-4cc6-9d00-1c3445298cd8" width="100%" />
</div>

**[전국 지점별 물류 배송 스케줄 캘린더]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/a137f49f-4695-40bd-a5e9-e2dfc61b0416" width="100%" />
</div>

---

### 4. 지점 소통 커뮤니티
* **지점 소통 커뮤니티:** 공지사항 상단 고정, 카테고리별 게시글 조회, 대댓글 소통, 파일/이미지 첨부 및 삭제 예외 처리 기능을 제공합니다.

**[커뮤니티 목록]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/bcf4c73d-45be-43a5-9c15-4b30741a0a75" width="100%" />
</div>

**[게시글 상세 및 삭제 알림]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/9cb6e7bd-54aa-4d32-8362-32541d742a8a" width="100%" />
</div>

**[댓글 및 대댓글 소통]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/5c092462-f9d9-42ce-b5f0-23c4418128c7" width="100%" />
</div>

**[새 게시글 작성]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/510c51f7-8fbf-4ac4-86ad-6454dc702556" width="100%" />
</div>

---

### 5. 마이페이지 및 계정 인증 시스템
* **마이페이지 기본 화면:** 시스템 주요 서비스 바로가기, 이용 안내 및 최근 접속 IP/보안 상태를 직관적으로 제공합니다.
* **신규 계정 회원가입:** 지점별 사용자 등록 및 담당 권한 설정을 위한 회원가입 모달 기능을 지원합니다.
* **아이디 및 비밀번호 찾기 (이메일 인증):** 이메일 연동을 통한 아이디 찾기 및 임시 비밀번호 발급(메일 전송) 기능을 구현하여 보안성을 강화했습니다.

**[마이페이지 기본 화면]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/312dffd4-45a8-4034-a9e7-4137951c7534" width="100%" />
</div>

**[신규 계정 회원가입 모달]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/e8cfc1c5-c182-4585-bc51-1482d5fb121f" width="100%" />
</div>

**[아이디 찾기 (이메일 인증)]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/c52a5ab7-fd6a-4c48-b8cf-00bc916e9254" width="100%" />
</div>

**[비밀번호 찾기 모달]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/e343ffa8-dec2-457a-827d-86ceb9141259" width="100%" />
</div>

**[임시 비밀번호 이메일 발송 내역]**
<div align="center">
  <img src="https://github.com/user-attachments/assets/0f1e3655-a52d-497d-826e-2d152c188ab3" width="100%" />
</div>

---

## 📁 프로젝트 구조

```text
busan-logistics-erp/
├── frontend/          # React, TypeScript 기반 클라이언트 UI
├── src/               # Java 17, Spring Boot 3.2 백엔드 API 서버
├── Dockerfile         # 컨테이너 배포 설정
└── build.gradle       # 백엔드 의존성 및 빌드 스크립트
