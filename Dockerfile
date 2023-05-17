FROM node:18-alpine
LABEL name "kaogeek-discord-bot"

WORKDIR /usr/src/bot

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build
ENV NODE_ENV=production
ENV BOT_TOKEN=
CMD ["node", "dist/src/client.js"]