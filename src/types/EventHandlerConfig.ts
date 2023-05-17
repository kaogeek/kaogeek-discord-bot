import { ClientEvents } from 'discord.js'

import { EventHandlerExecutor } from './EventHandlerExecutor.js'

export interface EventHandlerConfig<
  K extends keyof ClientEvents = keyof ClientEvents,
> {
  eventName: K
  execute: EventHandlerExecutor<K>
  once?: boolean
}
