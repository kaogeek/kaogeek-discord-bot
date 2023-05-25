import { ClientEvents } from 'discord.js'

import { CommandHandlerConfig } from './CommandHandlerConfig'
import { EventHandlerConfig } from './EventHandlerConfig'

export interface PluginContext {
  /**
   * Add an application command to the bot.
   */
  addCommand(config: CommandHandlerConfig): void

  /**
   * Add an event handler to the bot.
   */
  addEventHandler<K extends keyof ClientEvents>(
    config: EventHandlerConfig<K>,
  ): void
}
