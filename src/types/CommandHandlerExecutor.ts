import { CommandInteraction } from 'discord.js'

import type Bot from '../client.js'

export type CommandHandlerExecutor = (
  client: Bot,
  interaction: CommandInteraction,
) => void
