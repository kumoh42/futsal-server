
# 금오공과대학교 공식 풋살장 예약 서비스

![image](https://github.com/user-attachments/assets/b682ac8d-cebf-455c-9da1-2d77cb9c90cc)

## ❗프로젝트 소개

- 금오공과대학교 개발 동아리 '금오사이'에서 개발한 교내 공식 풋살장 예약 관리 서비스입니다.
- 기존에 사용하던 교내 예약 서비스는  불편한 예약 프로세스를 가지고 있었기에, 이를 간편하고 빠르게 예약하고 싶다는 요구사항에서 시작되었습니다.
- 총학생회 측에서 용이한 체육시설 관리, 각 동아리 사용자의 공평한 예약을 위해 개발되었습니다.
- 본 레포지토리는 기존 금오사이 풋살장 서비스를 리팩토링한 서버를 명세합니다.
  
<br>

## 👨🏻‍💻Backend 팀원 구성

<div align="center">

| **이지현** | **김현진** | **노현이** |**최주혁** | **김선진** |
| :------: |  :------: | :------: | :------: |:------: |
| [<img src="https://avatars.githubusercontent.com/u/77794756?v=4" height=150 width=150> <br/> @journeybongbong](https://github.com/journeybongbong)| [<img src="https://avatars.githubusercontent.com/u/98962864?v=4" height=150 width=150> <br/> @badasskim](https://github.com/badasskim)| [<img src="https://avatars.githubusercontent.com/u/122597763?v=4" height=150 width=150> <br/> @hyunoi](https://github.com/Hyunoi) | [<img src="https://avatars.githubusercontent.com/u/96466824?v=4" height=150 width=150> <br/> @Juhye0k](https://github.com/Juhye0k) | [<img src="https://avatars.githubusercontent.com/u/66009926?v=4" height=150 width=150> <br/> @gimseonjin](https://github.com/gimseonjin) | 


</div>

<br>

## 🔨개발 환경

  + Node.js (18.x)
  + Framework : Nest.js (10.x)
  + IDE : Vscode
  + Database : Mysql 8.0
  + Deployment : AWS EC2, ECR, Docker
  + Static Analysis Tool : SonarLint
  + Jira, Notion, Slack
<br>

## ⚙️채택한 개발 기술과 브랜치 전략

### Nest.js
  - typescript 기반 웹 프레임워크로 타입 검사, 의존성 주입 등으로 코드 재사용성을 꾀했습니다.
    
### 브랜치 전략
- Git-flow 전략을 기반으로 main, develop 브랜치와 feature 기능 브랜치로 간소화 하여 사용했습니다.
- main, develop, Feat 브랜치로 나누어 개발을 하였습니다.
    - **Main** 브랜치는 최종 배포 단계에서만 사용하는 브랜치입니다. dev 브랜치에서 병합 시 github action으로 ci/cd 가 이루어집니다.
    - **Dev** 브랜치는 개발 단계의 Feature 브랜치들의 집합 브랜치입니다.
    - **Feat** 브랜치는 기능 단위로 독립적인 개발 환경을 위하여 사용하였습니다. Feature 브랜치명은 Jira Service의 각 ticket에 부여되는 고유 id로 작성하였습니다.

<br>

## 📜프로젝트 구조

### System Diagram
<img src="https://private-user-images.githubusercontent.com/98962864/371168515-8b52f606-86fa-4fac-94a2-70a08f7bdd36.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjczNTg0OTgsIm5iZiI6MTcyNzM1ODE5OCwicGF0aCI6Ii85ODk2Mjg2NC8zNzExNjg1MTUtOGI1MmY2MDYtODZmYS00ZmFjLTk0YTItNzBhMDhmN2JkZDM2LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA5MjYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwOTI2VDEzNDMxOFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTE1YzFkZjM3MjQ5ZWEzMTZkZjViOWM3ZTg1MTc5OWZmYzAzZDVmMTc2YTE1MjAwYTFjYmQ3N2E1NWE0ZWRiNDkmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.hNC_msKvJ3_BLxVF4z6qsEEw36afz6c56iI9idbZ20s">



### Class Diagram
<img src="https://private-user-images.githubusercontent.com/98962864/371168616-af08da62-9976-4711-a759-a9e4316a5788.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjczNTg1MTMsIm5iZiI6MTcyNzM1ODIxMywicGF0aCI6Ii85ODk2Mjg2NC8zNzExNjg2MTYtYWYwOGRhNjItOTk3Ni00NzExLWE3NTktYTllNDMxNmE1Nzg4LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA5MjYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwOTI2VDEzNDMzM1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTdhNjkyZGE3NDY3MDc4MDkwMGE2ODU0MjhjODk0NjJlNzQ2OGE1NjRmYzkyOTE5MTdhNzRkMDBhNmUzMmIyODAmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.iuojaSU5DCj-8d2A_H1JT_fU5xFhoaLhJjdJDXfSuHc">

<br>


```
  src
	├── app.controller.ts
	├── app.module.ts
	├── app.service.ts
	├── auth
	│   ├── auth.controller.ts
	│   ├── auth.module.ts
	│   ├── auth.service.ts
	│   ├── dto
	│   │   └── create-user.dto.ts
	│   └── jwt
	│       ├── jwt.guard.ts
	│       └── jwt.payload.ts
	├── cache
	│   ├── cache.module.ts
	│   └── cache.service.ts
	├── common
	│   ├── decorators
	│   │   ├── permission.guard.ts
	│   │   └── user.decorator.ts
	│   ├── dto
	│   │   ├── inquiry-message.dto.ts
	│   │   ├── members
	│   │   │   └── members.dto.ts
	│   │   ├── reservation
	│   │   │   ├── block-reservation.dto.ts
	│   │   │   ├── month-reservation-delete.dto.ts
	│   │   │   ├── one-reservation-delete.dto.ts
	│   │   │   ├── pre-reservation-set.dto.ts
	│   │   │   └── register-reservation.dto.ts
	│   │   └── user
	│   │       ├── change-user.dto.ts
	│   │       └── make-user.dto.ts
	│   └── get-reservation.pipe.ts
	├── config
	│   └── swagger.config.ts
	├── entites
	│   ├── xe_member.entity.ts
	│   ├── xe_member.futsal.entity.ts
	│   ├── xe_reservation.entity.ts
	│   ├── xe_reservation_config.entity.ts
	│   ├── xe_reservation_cricle.entity.ts
	│   ├── xe_reservation_major.entity.ts
	│   ├── xe_reservation_member.entity.ts
	│   ├── xe_reservation_pre.entity.ts
	│   └── xe_reservation_time.entity.ts
	├── main.ts
	├── members
	│   ├── members.controller.ts
	│   ├── members.module.ts
	│   └── members.service.ts
	├── pipe
	│   └── parse-int.pipe.ts
	├── reservation
	│   ├── official-reservation
	│   │   ├── official-reservation.service.ts
	│   │   └── official-reservation.transaction.repository.ts
	│   ├── pre-reservation
	│   │   ├── pre-reservation.service.ts
	│   │   └── pre-reservation.transaction.repository.ts
	│   ├── reservation-scheduler.ts
	│   ├── reservation-slot.builder.ts
	│   ├── reservation.controller.ts
	│   ├── reservation.module.ts
	│   ├── reservation.service.ts
	│   └── time
	│       ├── reservation-time.service.ts
	│       └── reservation-time.transaction.repository.ts
	├── serverless.ts
	├── slack
	│   ├── slack.controller.ts
	│   ├── slack.module.ts
	│   └── slack.service.ts
	├── user
	│   ├── user.controller.ts
	│   ├── user.module.ts
	│   └── user.service.ts
	└── util
	    └── date-util.ts
```



<br>

## 🤝역할 분담

### 🐸김현진
- **기능**
    - 로그인 및 유효성 검사
    - 슬랙 연동
    - 유저 crud
    - 예약 삭제, 예약자 조회, 사용자 조회/삭제
    
### 🐷이지현
- **기능**
    - lambda 환경 세팅
    - 도커 빌드 및 배포
    - git CI/CD
    - 스케줄러 설정
    - 공휴일 구분

### 🐨노현이
- **기능**
    - 정식/우선 예약 시작
    - 우선 예약 재개/중지
    - 우선 예약 시간 설정
    - 예약 현황 조회
    - 스웨거 연동
    
### 🐻채주혁
- **기능**
    - 로그인 해시 리팩토링
    - 사전예약 재호출금지 구현
     
### 🐭김선진
- **멘토**
    - 코드 리뷰
    

