import { ClientEvents } from 'discord.js'

import { EventHandlerConfig } from './EventHandlerConfig.js'

export function defineEventHandler<K extends keyof ClientEvents>(
  config: EventHandlerConfig<K>,
): EventHandlerConfig<K> {
  return config
}
