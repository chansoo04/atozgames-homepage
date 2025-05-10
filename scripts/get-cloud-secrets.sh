#!/bin/bash
if gcloud version
then
  echo "gcloud 확인됨"
else
  echo "gcloud 설치해주세요!!"
  exit 1
fi

echo ".env.production.local"
gcloud secrets versions access "latest" --secret="production" --out-file="../.env.production.local" --project="carepet-io"

echo ".env.development.local"
gcloud secrets versions access "latest" --secret="development" --out-file="../.env.development.local" --project="carepet-io"

echo "다운로드 완료!"
exit 0
