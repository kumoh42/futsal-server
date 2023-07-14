# futsal-server
풋살장 예약 시스템 - 서버

</br>

## 👨‍💻프로젝트 소개
기존 풋살장 예약체계 시스템을 어드민 관점으로 리팩토링을 진행합니다.


본 레포지토리는 서버를 담당합니다.

</br>

## ⏲개발 기간
+ 2023.07.11 ~ 2023.08.26.(예정)

</br>

## 🧑‍🤝‍🧑팀원 구성
+ 프로젝트장 - 이지현
+ 팀원 - 김현진
+ 팀원 - 노현이
+ 멘토 - 김선진
+ 멘토 - 최혜민

</br>


## 🔨개발 환경
  + Node.js (18.x)
  + Framework : Nest.js (10.x)
  + IDE : Vscode
  + Database : Mysql 8.0
  + Deployment : AWS EC2
  + Static Analysis Tool : SonarLint
  + Jira, Notion, Slack

</br>

## 🤳주요 기능
+ 추후 재작성하겠습니다.

</br>
    
## How to Run

### 0 프로젝트 세팅

```
node version : v18.16.1
```

#### nvm 사용 방법
nvm을 통해 node.js 버전을 설정합니다.

##### 1. nvm 설치 방법

```
1. curl을 사용해서 nvm 설치를 진행합니다.
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

2. 아래 명령어를 통해 nvm 파일을 global 하게 쓸 수 있도록 세팅합니다.
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

##### 2. nvm 사용 방법
Windows는 Powershell에서 명령어를 입력해주세요.
프로젝트 폴더에서 아래 명령어를 실행합니다.

- 해당 버전 설치 </br>
```nvm install 만약 본인의 nvm에 해당 버전이 없다면 실행 ``` </br>
위 명령어를 입력하면 .nvmrc를 읽어서 v18.16.1을 설치합니다. 만약 missing 이 뜬다면 node 버전을 명시해서 실행해주세요.</br>
```nvm install {node version} ``` </br>


</br>

- 해당 버전 사용 </br>
```nvm use // 필수 실행 ``` </br>
위 명령어를 입력하면 .nvmrc를 읽어서 v18.16.1버전으로 변경합니다.

</br>

#### .env 설정

프로젝트 루트 폴더에 아래 정보를 가진 .env 파일을 만들어주세요.
데이터베이스 정보는 아래 도커 명령어에서 확인해주세요.

```
DATABASE_TYPE= 데이터베이스 종류
DATABASE_PORT= 데이터베이스 port 번호
DATABASE_HOST= 데이터베이스 주소
DATABASE_USERNAME= 데이터베이스 유저 이름
DATABASE_PASSWORD= 데이터베이스 비밀번호
DATABASE_NAME= 데이터베이스 스키마 이름
```

</br>

#### 데이터베이스 설정
아래 명령어를 통해 3306 포트에 mysql을 설정합니다.
```

docker run -p 3306:3306 --name kumoh42 -e MYSQL_ROOT_PASSWORD='원하는 비밀번호' -e MYSQL_DATABASE=futsal -d mysql:8.0 
```
</br>
이때 서버 실행 시, 해당 데이터베이스를 찾지 못 한다면 도커 설정 포트를 변경(다른 포트를 사용)하여 다시 데이터베이스를 설정해주세요.
</br>또는 대기 한 후 서버를 재실행해보세요. 

```
[예시 : 포트 번호를 13306으로 변경]
docker run -p 13306:3306 --name kumoh42 -e MYSQL_ROOT_PASSWORD='원하는 비밀번호' -e MYSQL_DATABASE=futsal -d mysql:8.0 
```
비밀번호 입력 시 따옴표 생략해주세요.


</br>

### 프로젝트 시작

```
1. 개발 모드로 실행
npm run start:dev

2. 실제 서버 모드로 실행
npm run start
```
