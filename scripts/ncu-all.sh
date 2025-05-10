#!/bin/bash

ignores="slonik,nanoid"

yarn workspaces list --json | jq .location | tr -d '"' | \
while read -r dir
do (
  cd "../$dir" || exit;
  ncu -u --reject "$ignores"
) done;

yarn;
