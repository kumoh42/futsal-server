# futsal-server
풋살장 예약 시스템 - 서버

## 👨‍💻프로젝트 소개
기존 풋살장 예약체계 시스템을 어드민 관점으로 리팩토링을 진행합니다.


본 레포지토리는 서버를 담당합니다.


## ⏲개발 기간
+ 2023.07.11 ~ 2023.08.26.(예정)

## 🧑‍🤝‍🧑팀원 구성
+ 프로젝트장 - 이지현
+ 팀원 - 김현진
+ 팀원 - 노현이
+ 멘토 - 김선진
+ 멘토 - 최혜민


## 🔨개발 환경
  + Node.js (18.x)
  + Framework : Nest.js (10.x)
  + IDE : Vscode
  + Database : Mysql 8.0
  + Deployment : AWS EC2
  + Static Analysis Tool : SonarLint
  + Jira, Notion, Slack

## 🤳주요 기능
+ 추후 재작성하겠습니다.

    
## How to Run

### 0 프로젝트 세팅

```
node version : v18.16.1
```

#### nvm 사용 방법

##### 1. nvm 설치 방법
```
1. curl을 사용해서 nvm 설치를 진행합니다.
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

2. 아래 명령어를 통해 nvm 파일을 global 하게 쓸 수 있도록 세팅합니다.
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

##### 2. nvm 사용 방법
- 해당 버전 설치 </br>
```nvm install 만약 본인의 nvm에 해당 버전이 없다면 실행 ``` </br>
위 명령어를 입력하면 .nvmrc를 읽어서 v18.16.1을 설치합니다.

</br>

- 해당 버전 사용 </br>
```nvm use // 필수 실행 ``` </br>
위 명령어를 입력하면 .nvmrc를 읽어서 v18.16.1버전으로 변경합니다.


#### .env 설정

프로젝트 루트 폴더에 아래 정보를 가진 .env 파일을 만들어주세요

```
DATABASE_TYPE= 데이터베이스 종류
DATABASE_PORT= 데이터베이스 port 번호
DATABASE_HOST=디비 주소
DATABASE_USERNAME= 디비 유저 이름
DATABASE_PASSWORD= 디비 비밀번호
DATABASE_NAME= 디비 스키마 이름
```

#### 데이터베이스 설정

```
아래 명령어를 통해 3306 포트에 mysql을 설정합니다.

docker run -p 3306:3306 --name kumoh42 -e MYSQL_ROOT_PASSWORD='원하는 비밀번호' -d mysql:8.0 
```

### 프로젝트 시작

```
1. 개발 모드로 실행
npm run start:dev

2. 실제 서버 모드로 실행
npm run start
```