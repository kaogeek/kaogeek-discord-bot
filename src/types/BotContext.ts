import { Client } from 'discord.js'

import { RuntimeConfiguration } from '@/utils/RuntimeConfiguration'

import { Logger } from './Logger'

/**
 * A shared context object that is passed to all command handlers.
 */
export interface BotContext {
  /**
   * A Discord.js client instance.
   */
  readonly client: Client

  /**
   * Access runtime configuration.
   */
  readonly runtimeConfiguration: RuntimeConfiguration

  /**
   * Logger.
   */
  readonly log: Logger
}
