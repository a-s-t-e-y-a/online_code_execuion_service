#!/bin/bash
set -e
git clone https://github.com/engineer-man/piston.git ../piston
( cd ../piston && docker-compose up -d api && cd cli && npm i )
../piston/cli/index.js ppman install node
../piston/cli/index.js ppman install python
pnpm install
docker-compose up -d
pnpm run db:generate
pnpm run db:migrate
pnpm run build
cp .env dist/
pm2 start dist/src/main.js --name "online-code-execution-service" --output /dev/null --error error.log