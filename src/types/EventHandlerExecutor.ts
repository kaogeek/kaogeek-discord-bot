import { Awaitable, ClientEvents } from 'discord.js'

import { BotContext } from './BotContext'

export type EventHandlerExecutor<K extends keyof ClientEvents> = (
  ...arguments_: [botContext: BotContext, ...args: ClientEvents[K]]
) => Awaitable<void>
