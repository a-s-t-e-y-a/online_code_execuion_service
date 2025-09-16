#!/bin/bash
set -e
pnpm install
docker-compose up -d
pnpm run db:generate
pnpm run db:migrate
pnpm run build
cp .env dist/
pm2 start dist/src/main.js --name "online-code-execution-service" --output /dev/null --error error.log