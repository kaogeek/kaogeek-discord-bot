import { Awaitable, CommandInteraction } from 'discord.js'

import { BotContext } from './BotContext.ts'

export type CommandHandlerExecutor = (
  botContext: BotContext,
  interaction: CommandInteraction,
) => Awaitable<void>
