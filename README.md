# Kao.Geek bot

Discord bot for KaoGeek, built with TypeScript and [discord.js](https://discord.js.org)

## Setup

- Make sure to use same node version as specified in `.nvmrc` by using [nvm](https://github.com/nvm-sh/nvm)

  ```bash
  nvm use
  ```

  If not installed, use `nvm install` to install specified version in `.nvmrc`
  (at the time of writing `lts/hydrogen`)

- Install [pnpm](https://pnpm.io/installation) if you don't have one installed, you can install using npm

  ```bash
  npm install -g pnpm
  ```

- Install dependencies

  ```bash
  pnpm install
  ```

## Discord Bot & Server Setup (For Development)

- <details><summary>Open Discord app, create your own Discord server for bot development</summary><img width="416" alt="00" src="https://github.com/narze/kaogeek-discord-bot/assets/248741/7cfc809c-42b0-4587-8ed7-113ffa4a8edd"></details>
- <details><summary>Right click at your server's icon, copy server ID (This will be <code>GUILD_ID</code> in your <code>.env</code>)</summary><img width="191" alt="01-copy-server-id" src="https://github.com/narze/kaogeek-discord-bot/assets/248741/86d029de-16a6-4686-ae7d-9586f522e956"></details>
- <details><summary> Right clict at your text channel, copy channel ID (This will be <code>MOD_CHANNEL_ID</code> in your <code>.env</code>)</summary><img width="332" alt="4" src="https://github.com/narze/kaogeek-discord-bot/assets/248741/a0c19b2f-6985-4fa4-bda1-030a3679bac4"></details>
- <details><summary>Go to <a href="https://discord.com/developerQs/applications" target="_blank">Discord Developer Portal</a> and create a new application, name it whatever you want</summary><img width="1259" alt="1" src="https://github.com/narze/kaogeek-discord-bot/assets/248741/a6b79d46-ca2c-4dad-8ed0-e419cbe8dda7"></details>
- <details><summary>Go to your application's <code>Bot</code> tab get the bot's token by clicking <code>Reset Token</code> button, copy the token and keep it save, don't share this to anyone! (This will be <code>BOT_TOKEN</code> in your <code>.env</code>)</summary><img width="758" alt="2" src="https://github.com/narze/kaogeek-discord-bot/assets/248741/dcbba104-d60d-421e-adeb-e43f5fcebe87"></details>
- <details><summary>In the same window under the <code>Privileged Gateway Intents</code> section,  enable <code>PRESENCE INTENT</code>, <code>SERVER MEMBERS INTENT</code>, and <code>MESSAGE CONTENT INTENT</code></summary><img width="1246" alt="3" src="https://github.com/narze/kaogeek-discord-bot/assets/248741/c080d952-3407-4b0d-9dca-0ae338f08aab"></details>
- <details><summary>Go to <code>OAuth2</code> -> <code>URL Generator</code> tab, select <code>bot</code> and <code>applications.commands</code> scopes, then select permissions under <code>Bot Permissions</code> section, copy the generated URL and paste it in your browser, then choose your server to add the bot.</summary><img width="1250" alt="5" src="https://github.com/narze/kaogeek-discord-bot/assets/248741/51727677-ff83-4103-a5c7-9e4e4a36284e"></details>
  You can set to <code>Administrator</code> for ease of development, but it's not recommended for production.

## Development

- Copy the `.env.example` to `.env`

  ```bash
  cp .env.example .env
  ```

- Then, set all variables in `.env` file

  <details>
    <summary>ENV Variables</summary>

  - `BOT_TOKEN` Discord bot token
  - `GUILD_ID` Discord server ID
  - `MESSAGE_COOLDOWN_SEC` cooldown to push the sticky message to the bottom of channel
  - `MESSAGE_MAX` the maximum message before push sticky message to the bottom of channel
  - `MOD_CHANNEL_ID` Discord channel ID for bot to report moderation actions
  - `DATABASE_URL` Prisma database URL, you can use SQLite for development, set it to `file:./dev.db`
  </details>

- To run the bot in development mode

  ```bash
  pnpm dev
  ```

- Or run the bot in watch mode with automatic rerun on changes

  ```bash
  pnpm dev:watch
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
