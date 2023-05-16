# -------------------------------------------------------- #

# install pnpm
FROM node:18.12-alpine3.17 AS base

RUN npm install -g pnpm

# -------------------------------------------------------- #

# install dependencies with pnpm
FROM base AS dependencies

WORKDIR /app

# copy package and lock file for install the dependencies
COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install

# -------------------------------------------------------- #

# build the application
FROM base AS builder

WORKDIR /app

# copy the dependencies that was installed in the dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# copy src and other that not in the .dockerignore
COPY . .

RUN pnpm build

# remove the dev dependencies
RUN pnpm prune --prod

# -------------------------------------------------------- #

# copy the built service from stage build and run the application
FROM base as runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# expose port 3000
EXPOSE 3000

CMD ["node", "dist/client.js"]