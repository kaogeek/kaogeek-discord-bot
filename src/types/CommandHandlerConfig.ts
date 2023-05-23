import { ApplicationCommandData } from 'discord.js'

import { CommandHandlerExecutor } from './CommandHandlerExecutor'

export interface CommandHandlerConfig {
  data: ApplicationCommandData
  ephemeral?: boolean
  execute: CommandHandlerExecutor
}
