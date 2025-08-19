## ATOZ WEB PROJECT

### 1. 각 패키지별 역할

- homepage(next.js)
  - 아토즈게임즈 홈페이지
  - 아토즈 포커 인게임 공지사항, 1:1 문의 웹뷰
- login(next.js)
  - 아토즈 포커 인게임 로그인 웹뷰
- ~~backend(nest.js)~~
  - 과거에 사용하던 nest.js 자체 서버. 현재는 사용하지 않음

### 2. 최초 프로젝트 실행 방법

- 환경변수 파일(.env.development.local)을 담당자에게 요청한다
- yarn install 스크립트 파일(scripts/ca-refresh-local/sh)을 담당자에게 요청한다
- AWS CLI를 로컬에 세팅한다(atoz-tools의 iam 계정으로 로그인 필요, access key 또는 sso 방식 권장)
- 프로젝트 루트에서 아래 명령어를 실행한다
```
# 자체 패키지 다운로드 및 yarn install 실행
./scripts/ca-refresh-local.sh
```

### 3. 개발 서버 실행 방법

- 전체 패키지(apps 내 폴더들)를 실행하려면 아래 명령어를 실행한다
```
yarn env:dev yarn dev
```
- 특정 패키지를 실행하고 싶다면 아래 명령어를 실행한다
```
yarn env:dev yarn dev --filter={패키지 이름}...
```

### 4. 기타 사항

- 담당자에게 문의 부탁드립니다