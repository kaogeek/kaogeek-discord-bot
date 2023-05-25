import { ClientEvents } from 'discord.js'

import { EventHandlerConfig } from './EventHandlerConfig'

export interface PluginContext {
  addEventHandler<K extends keyof ClientEvents>(
    handler: EventHandlerConfig<K>,
  ): void
}
