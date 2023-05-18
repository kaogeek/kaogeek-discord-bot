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

## Development

- Copy the `.env.example` to `.env`

  ```bash
  cp .env.example .env
  ```

- Then, set all variables in `.env` file

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
