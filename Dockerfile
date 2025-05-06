############ 1단계: Dependencies & Build ############
FROM node:20-bookworm AS deps
WORKDIR /workspace

# 루트의 패키지 매니페스트만 먼저 복사해 캐시 활용
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile   # Yarn Workspaces 지원 :contentReference[oaicite:1]{index=1}

############ 2단계: Compile Backend ############
FROM node:20-bookworm AS builder
WORKDIR /workspace

# 의존성 레이어 재사용
COPY --from=deps /workspace /workspace

# 소스 코드 복사
COPY apps ./apps
COPY nest-cli.json tsconfig*.json ./

# 백엔드만 빌드 → dist/apps/backend/** 생성
WORKDIR /workspace/apps/backend
RUN yarn build                       # Nest CLI 빌드 :contentReference[oaicite:2]{index=2}

############ 3단계: Runtime ############
FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /app

# ① 백엔드 dist 복사
COPY --from=builder /workspace/apps/backend/dist ./dist

# ② 루트 node_modules 전체 복사 (필요 시 workspaces focus로 축소 가능) :contentReference[oaicite:3]{index=3}
COPY --from=builder /workspace/node_modules ./node_modules

# ③ 실행
EXPOSE 8080
CMD ["node", "dist/main.js"]
