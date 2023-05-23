import { ClientEvents } from 'discord.js'

import { EventHandlerExecutor } from './EventHandlerExecutor'

export interface EventHandlerConfig<
  K extends keyof ClientEvents = keyof ClientEvents,
> {
  eventName: K
  execute: EventHandlerExecutor<K>
  once?: boolean
}

// This is for use in an array, e.g. [...] satisfies AnyEventHandlerConfig[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEventHandlerConfig = EventHandlerConfig<any>
