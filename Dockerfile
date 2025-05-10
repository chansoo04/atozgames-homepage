################### 1) Build Stage ###################
FROM node:20-bookworm AS builder
WORKDIR /workspace

# ① 전체 소스 복사 (간단하지만 가장 안정적)
COPY . .

# ② 모든 워크스페이스 의존성 설치
RUN yarn install --frozen-lockfile      # devDeps 포함 :contentReference[oaicite:2]{index=2}

# ③ 백엔드만 빌드 – nest CLI는 apps/backend/node_modules/.bin 에 존재
RUN yarn workspace backend build        # = "nest build" :contentReference[oaicite:3]{index=3}

################### 2) Runtime Stage ###################
FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /app

# ④ 빌드 산출물·필요 의존성 복사
COPY --from=builder /workspace/apps/backend/dist ./dist
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/backend/node_modules ./node_modules

EXPOSE 8080
CMD ["node", "dist/main.js"]
