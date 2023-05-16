import { ClientEvents } from 'discord.js'

import type Bot from '../client.js'

export type EventHandlerExecutor<K extends keyof ClientEvents> = (
  ...args: [...ClientEvents[K], Bot]
) => void

export interface EventHandlerConfig<
  K extends keyof ClientEvents = keyof ClientEvents
> {
  eventName: K
  execute: EventHandlerExecutor<K>
  once?: boolean
}
