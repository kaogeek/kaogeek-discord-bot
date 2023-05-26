import { Awaitable, CommandInteraction } from 'discord.js'

import { BotContext } from './BotContext'

export type CommandExecutor = (
  botContext: BotContext,
  interaction: CommandInteraction,
) => Awaitable<void>
