import { Client, Collection, IntentsBitField } from 'discord.js'

import commands from './commands/index.js'
import { Environment } from './config.js'
import events from './events/index.js'
import { prisma } from './prisma.js'
import { CommandHandlerConfig } from './types/CommandHandlerConfig.js'
import { EventHandlerConfig } from './types/EventHandlerConfig.js'

export default class Bot extends Client {
  public commands: Collection<string, CommandHandlerConfig>
  public isProduction = process.env.NODE_ENV === 'production'

  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
      ],
    })

    this.commands = new Collection()
  }

  async initAndStart() {
    console.info(`[ENV] ${this.isProduction ? 'Production' : 'Development'}`)
    this.loadHandlers()

    await this.login(Environment.BOT_TOKEN)
  }

  loadHandlers() {
    this.loadEventHandlers(events as EventHandlerConfig[])
    this.loadCommandHandlers(commands)
  }

  loadEventHandlers(handlers: EventHandlerConfig[]) {
    console.info('[HANDLER] Setting up event handlers ...')

    for (const handler of handlers) {
      if (handler.once) {
        this.once(handler.eventName, (...args) =>
          handler.execute(this, ...args),
        )
      } else {
        this.on(handler.eventName, (...args) => handler.execute(this, ...args))
      }
    }
  }

  loadCommandHandlers(handlers: CommandHandlerConfig[]) {
    for (const handler of handlers) {
      this.commands.set(handler.data.name, handler)
    }
  }
}

if (process.argv.includes('--smoke')) {
  // Performs a basic smoke test
  console.info('[SMOKE] Running smoke test...')
  const result = await prisma.messageReportCount.count()
  console.info(`[SMOKE] Number of message reports: ${result}`)
  console.info(`[SMOKE] OK, database connection is working!`)

  // Attempt to load handlers
  new Bot().loadHandlers()
  console.info(`[SMOKE] OK, loading handlers is working!`)
} else {
  // Run the bot
  new Bot().initAndStart()
}
