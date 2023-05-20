import { Awaitable, CommandInteraction } from 'discord.js'

import { BotContext } from './BotContext.js'

export type CommandHandlerExecutor = (
  botContext: BotContext,
  interaction: CommandInteraction,
) => Awaitable<void>
