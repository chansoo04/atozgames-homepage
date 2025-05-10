###################
# BASE IMAGE
###################
FROM node:20.12.2-alpine3.19 AS base

# 필수 패키지 설치 (python3, py3-pip, bash, pipx)
RUN apk update && \
    apk add --no-cache python3 py3-pip bash pipx

# pipx 환경 설정
ENV PATH="$PATH:/root/.local/bin"

# 작업 디렉토리 설정
WORKDIR /usr/src/app

###################
# DEVELOPMENT STAGE
###################
FROM base AS development

# root-level 의존성 파일만 복사
COPY --chown=node:node . .

# root-level 의존성 설치
RUN yarn install

# 전체 소스 복사
COPY --chown=node:node . .

# Node 권한으로 실행
USER node

###################
# BUILD STAGE
###################
FROM base AS build

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 소스 코드 복사
COPY --chown=node:node . .

# 의존성 복사 (development 스테이지에서 가져옴)
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=development /usr/src/app/apps/backend/node_modules ./apps/backend/node_modules

# 빌드 실행
RUN yarn build --filter=backend...

###################
# PRODUCTION STAGE
###################
FROM node:20.12.2-alpine3.19 AS production

WORKDIR /usr/src/app

# 필요한 빌드된 파일만 복사
COPY --chown=node:node --from=build /usr/src/app/apps/backend/node_modules ./apps/backend/node_modules
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/apps/backend/dist ./apps/backend/dist

# 환경변수 설정
ENV NODE_ENV production

# 실행 명령 설정
CMD ["node", "apps/backend/dist/src/main.js"]
