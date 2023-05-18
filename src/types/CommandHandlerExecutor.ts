import { Awaitable, CommandInteraction } from 'discord.js'

import type Bot from '../client.js'

export type CommandHandlerExecutor = (
  client: Bot,
  interaction: CommandInteraction,
) => Awaitable<void>
