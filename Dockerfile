FROM node:18-alpine as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npx pnpm -r i --frozen-lockfile

COPY src ./src
COPY tsconfig.json ./

RUN npx pnpm build

COPY package.json pnpm-lock.yaml ./

# ? -------------------------

FROM node:18-alpine as deps-prod

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npx pnpm -r i --frozen-lockfile --prod

# ? -------------------------

FROM gcr.io/distroless/nodejs18-debian11:nonroot as runner

LABEL name "kaogeek-discord-bot"

USER nonroot
ENV NODE_ENV production

COPY package.json ./
COPY --chown=nonroot:nonroot --from=deps-prod /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot --from=builder /app/dist ./dist

CMD ["dist/client.js"]
