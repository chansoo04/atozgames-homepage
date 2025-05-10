#!/bin/bash
if cloud-sql-proxy --version
then
  echo "cloud-sql-proxy 확인됨"
else
  echo "cloud-sql-proxy 설치해주세요!!"
  exit 1
fi

cloud-sql-proxy carepet-io:asia-northeast3:postgresql
