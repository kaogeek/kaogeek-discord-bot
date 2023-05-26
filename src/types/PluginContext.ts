import { ClientEvents } from 'discord.js'

import { BotContext } from './BotContext'
import { CommandConfig } from './CommandConfig'
import { EventHandlerConfig } from './EventHandlerConfig'

export type PluginInitializer = (botContext: BotContext) => Promise<void>

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

  /**
   * Add an initialization logic to the bot.
   * Bot will not start until all initializations are done.
   */
  addInitializer(init: PluginInitializer): void
}
