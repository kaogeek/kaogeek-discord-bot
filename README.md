# Kao.Geek bot

Discord bot for KaoGeek, built with TypeScript

## Setup

```bash
# Install dependencies
pnpm install

cp .env.example .env
```

## Development

You need to set the `BOT_TOKEN` environment variable in `.env` file first before running the bot

```bash
# Run the bot in development mode
pnpm dev
```

Before pushing your code please run `pnpm format` to fix any issues

## Deploy
- Run with Docker
    ```bash
    docker build -t kaogeek-discord-bot .
    docker run -d --env-file=.env --name kaogeek-discord-bot kaogeek-discord-bot
    ```
- Run with Node
    ```
    pnpm install
    pnpm build
    pnpm start
    ```