FROM node:18-alpine
LABEL name "kaogeek-discord-bot"

# PNPM installation
RUN npm install -g pnpm

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install

# Bundle app source
COPY . .

# Build app
RUN pnpm run build

# Run app
CMD [ "pnpm", "start" ]