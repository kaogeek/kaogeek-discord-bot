import { Client, Collection } from 'discord.js'

import { CommandHandlerConfig } from './CommandHandlerConfig.js'

export interface BotContext {
  readonly client: Client
  readonly commands: Collection<string, CommandHandlerConfig>
}
