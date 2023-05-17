import { ClientEvents } from 'discord.js'

import type Bot from '../client.js'

export type EventHandlerExecutor<K extends keyof ClientEvents> = (
  ...args: [Bot, ...ClientEvents[K]]
) => void
