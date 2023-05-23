import { ApplicationCommandData } from 'discord.js'

import { CommandHandlerExecutor } from './CommandHandlerExecutor.ts'

export interface CommandHandlerConfig {
  data: ApplicationCommandData
  ephemeral?: boolean
  execute: CommandHandlerExecutor
}
