import { ApplicationCommandData } from 'discord.js'

import { CommandHandlerExecutor } from './CommandHandlerExecutor.js'

export interface CommandHandlerConfig {
  data: ApplicationCommandData
  ephemeral?: boolean
  execute: CommandHandlerExecutor
}
