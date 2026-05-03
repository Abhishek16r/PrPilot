FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lock* ./
COPY packages/ ./packages/
COPY apps/worker/ ./apps/worker/
COPY turbo.json ./

RUN bun install

WORKDIR /app/apps/worker
EXPOSE 3001
CMD ["bun", "run", "src/index.ts"]
