

# 금오공과대학교 공식 풋살장 예약 서비스

<img src="https://private-user-images.githubusercontent.com/98962864/365073953-c72b7000-e9d8-40e5-b972-47d66f49b560.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjczMzc0NzEsIm5iZiI6MTcyNzMzNzE3MSwicGF0aCI6Ii85ODk2Mjg2NC8zNjUwNzM5NTMtYzcyYjcwMDAtZTlkOC00MGU1LWI5NzItNDdkNjZmNDliNTYwLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA5MjYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwOTI2VDA3NTI1MVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTBkZjQxYjExYTgwMDQ4MjE0ZWMyOTI4MmRiNDliMzIyYTAwN2M2YWNmMWYwOTUzNGE4ODJkYmQ2Y2NjMzgwODcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.hd1PuC3ztVTtdN7NfZzNvSiyTLZIj2wLbEHuyJWtP9E">

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
<img src="https://private-user-images.githubusercontent.com/98962864/365072568-86c19c05-e11b-486c-9827-9111089efd68.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjczMzc1MTQsIm5iZiI6MTcyNzMzNzIxNCwicGF0aCI6Ii85ODk2Mjg2NC8zNjUwNzI1NjgtODZjMTljMDUtZTExYi00ODZjLTk4MjctOTExMTA4OWVmZDY4LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA5MjYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwOTI2VDA3NTMzNFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTliODQ4ZmU5NjZkN2NmNDU0NDliNjlmNWI1NTU2MDEwZTc1YzdjMTIxZWFmMWI5MThlM2I5NDA0NjM1NGFmZmImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.18tUySE4axshfLeaLdDzgENKpxbo7MFa0gcXQaJoLjI">



### Class Diagram
<img src="https://private-user-images.githubusercontent.com/98962864/363934167-3f35e771-9917-4062-b3cc-619c8af9c100.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjczMzc0OTAsIm5iZiI6MTcyNzMzNzE5MCwicGF0aCI6Ii85ODk2Mjg2NC8zNjM5MzQxNjctM2YzNWU3NzEtOTkxNy00MDYyLWIzY2MtNjE5YzhhZjljMTAwLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA5MjYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwOTI2VDA3NTMxMFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTAwNjNhNzQxZDdjZmE2OTkwZWIwZGEzNTcxZjQ5ODlhYjkwMGI3YjI0MzVmN2M3MTZkNTM0YTJlOGJiMTU0MzkmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.qDtFH7bkDavYkPNQ4usgzY7ZxdOGcnKY8Dec5qeeIzw">

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
    

