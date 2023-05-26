import { ClientEvents } from 'discord.js'

import { CommandConfig } from './CommandConfig'
import { EventHandlerConfig } from './EventHandlerConfig'

export interface PluginContext {
  /**
   * Add an application command to the bot.
   */
  addCommand(config: CommandConfig): void

  /**
   * Add an event handler to the bot.
   */
  addEventHandler<K extends keyof ClientEvents>(
    config: EventHandlerConfig<K>,
  ): void
}
