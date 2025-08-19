#!/usr/bin/env bash
# scripts/ca-refresh-vercel.sh
# Vercel 빌드 컨테이너에서 CodeArtifact 토큰 갱신 + .npmrc 생성
set -euo pipefail

### ─── 환경변수 읽기(필수) ──────────────────────────────────────────
: "${CA_DOMAIN:?set CA_DOMAIN in Vercel Env Vars}"
: "${CA_DOMAIN_OWNER:?set CA_DOMAIN_OWNER in Vercel Env Vars}"
: "${CA_REGION:=${AWS_REGION:-ap-northeast-1}}"
: "${CA_REPOSITORY:?set CA_REPOSITORY in Vercel Env Vars}"
: "${NPM_SCOPE:=@atozgames}"
: "${NPMRC_PATH:=.npmrc}"
### ──────────────────────────────────────────────────────────────────

# AWS CLI 설치(없으면)
if ! command -v aws >/dev/null 2>&1; then
  echo "⬇️  Installing AWS CLI v2..."
  curl -sSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
  unzip -q /tmp/awscliv2.zip -d /tmp
  /tmp/aws/install -i "$HOME/.aws-cli" -b "$HOME/.local/bin"
  export PATH="$HOME/.local/bin:$PATH"
fi

echo "🧪 aws --version: $(aws --version 2>&1 || true)"

# 토큰 발급
echo "🔐 CodeArtifact 토큰 발급 중..."
TOKEN="$(aws codeartifact get-authorization-token \
  --domain "$CA_DOMAIN" \
  --domain-owner "$CA_DOMAIN_OWNER" \
  --region "$CA_REGION" \
  --duration-seconds 43200 \
  --query authorizationToken --output text)"

# 레지스트리 URL 계산
REG_HOST="${CA_DOMAIN}-${CA_DOMAIN_OWNER}.d.codeartifact.${CA_REGION}.amazonaws.com"
REG_PATH="npm/${CA_REPOSITORY}/"
REG_URL="https://${REG_HOST}/${REG_PATH}"

# .npmrc 생성/갱신
cat > "$NPMRC_PATH" <<EOF
registry=https://registry.npmjs.org/
${NPM_SCOPE}:registry=${REG_URL}
always-auth=true
//${REG_HOST}/${REG_PATH}:_authToken=${TOKEN}
EOF

echo "✅ ${NPMRC_PATH} 작성 완료: ${NPM_SCOPE} → ${REG_URL}"
