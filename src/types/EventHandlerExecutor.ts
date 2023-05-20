import { Awaitable, ClientEvents } from 'discord.js'

import { BotContext } from './BotContext.js'

export type EventHandlerExecutor<K extends keyof ClientEvents> = (
  ...args: [botContext: BotContext, ...args: ClientEvents[K]]
) => Awaitable<void>
