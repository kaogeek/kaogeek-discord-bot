import { ClientEvents } from 'discord.js'

import type Bot from '../client'

export type EventHandlerExecutor<K extends keyof ClientEvents> = (
  ...args: [Bot, ...ClientEvents[K]]
) => void

export interface EventHandlerConfig<
  K extends keyof ClientEvents = keyof ClientEvents
> {
  eventName: K
  execute: EventHandlerExecutor<K>
  once?: boolean
}
