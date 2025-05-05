######## 1단계: 빌드 ########
FROM node:20-bookworm AS builder
WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install --production=false

COPY . .
# Nest → dist/
RUN yarn build

######## 2단계: 런타임 ########
FROM node:20-slim
# 런타임 최적화용 환경 변수
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Nest 기본 포트
EXPOSE 8080
CMD ["node", "dist/main.js"]
