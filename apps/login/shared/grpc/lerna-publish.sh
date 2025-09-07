#!/bin/bash

export CODEARTIFACT_AUTH_TOKEN=`aws codeartifact login --tool npm --repository repo --domain atozgames --domain-owner 842675988186 --region ap-northeast-1 --profile atoz-tools-codeartifact-fetcher`

lerna publish
# npx lerna publish --force-publish
