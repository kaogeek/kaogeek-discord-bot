# Kao.Geek bot

Discord bot for KaoGeek, built with TypeScript and [discord.js](https://discord.js.org)

## Setup

- Make sure to use same node version as specified in `.nvmrc` by using [nvm](https://github.com/nvm-sh/nvm)

  ```bash
  nvm use
  ```

  If not installed, use `nvm install` to install specified version in `.nvmrc`
  (at the time of writing `lts/hydrogen`)

- Install dependencies

  ```bash
  pnpm install
  ```

## Discord Bot & Server Setup (For Development)

- Open Discord app, create your own Discord server for bot development
- Right click at your server's icon, copy server ID (This will be `GUILD_ID` in your `.env`)
- Right clict at your text channel, copy channel ID (This will be `MOD_CHANNEL_ID` in your `.env`)
- Go to [Discord Developer Portal](https://discord.com/developers/applications) and create a new application, name it whatever you want
- Go to your application's `Bot` tab get the bot's token by clicking `Reset Token` button, copy the token and keep it save (This will be `BOT_TOKEN` in your `.env`)
- In the same window under the `Privileged Gateway Intents` section,  enable `PRESENCE INTENT`, `SERVER MEMBERS INTENT`, and `MESSAGE CONTENT INTENT`
- Go to `OAuth2` -> `URL Generator` tab, select `bot` and `applications.commands` scopes, then select permissions under `Bot Permissions` section, copy the generated URL and paste it in your browser, then choose your server to add the bot.
  - You can set to `Administrator` for ease of development, but it's not recommended for production.

## Development

- Copy the `.env.example` to `.env`

  ```bash
  cp .env.example .env
  ```

- Then, set all variables in `.env` file

<details>
  <summary><b>ENV Variables</b></summary>

- `BOT_TOKEN` Discord bot token
- `GUILD_ID` Discord server ID
- `MOD_CHANNEL_ID` Discord channel ID for bot to report moderation actions
- `DATABASE_URL` Prisma database URL, you can use SQLite for development, set it to `file:./dev.db`
</details>

- To run the bot in development mode

  ```bash
  pnpm dev
  ```

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
