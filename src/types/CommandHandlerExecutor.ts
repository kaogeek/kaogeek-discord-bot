<<<<<<< Updated upstream
import { CommandInteraction } from 'discord.js'
=======
import type { CommandInteraction } from 'discord.js'
>>>>>>> Stashed changes

import type Bot from '../client.js'

export type CommandHandlerExecutor = (
  client: Bot,
  interaction: CommandInteraction,
) => void
