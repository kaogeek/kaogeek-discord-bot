import { ApplicationCommandData, CommandInteraction } from 'discord.js'

import type Bot from '../client.js'

export type CommandHandlerExecutor = (
  client: Bot,
  interaction: CommandInteraction,
) => void

export interface CommandHandlerConfig {
  data: ApplicationCommandData
  ephemeral?: boolean
  execute: CommandHandlerExecutor
}
