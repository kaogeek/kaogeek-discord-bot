import { ClientEvents } from 'discord.js'

import { CommandHandlerConfig } from './CommandHandlerConfig'
import { EventHandlerConfig } from './EventHandlerConfig'

export interface PluginContext {
  addCommand(handler: CommandHandlerConfig): void
  addEventHandler<K extends keyof ClientEvents>(
    handler: EventHandlerConfig<K>,
  ): void
}
