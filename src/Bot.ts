import { Client, Collection, IntentsBitField } from 'discord.js'

import commands from './commands/index'
import { Environment } from './config'
import events from './events/index'
import { BotContext } from './types/BotContext'
import { CommandHandlerConfig } from './types/CommandHandlerConfig'
import { EventHandlerConfig } from './types/EventHandlerConfig'
import { RuntimeConfiguration } from './utils/RuntimeConfiguration'

export class Bot {
  public readonly client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ],
  })
  private readonly runtimeConfiguration = new RuntimeConfiguration()
  private readonly commands = new Collection<string, CommandHandlerConfig>()
  private readonly isProduction = process.env.NODE_ENV === 'production'

  private createBotContext() {
    return {
      client: this.client,
      commands: this.commands,
      runtimeConfiguration: this.runtimeConfiguration,
    } as BotContext
  }

  async initAndStart() {
    console.info(`[ENV] ${this.isProduction ? 'Production' : 'Development'}`)
    this.loadHandlers()

    const initialRuntimeConfig = await this.runtimeConfiguration.init()
    console.info('[CONFIG] Runtime configuration loaded', initialRuntimeConfig)

    await this.client.login(Environment.BOT_TOKEN)
  }

  loadHandlers() {
    this.loadEventHandlers(events as EventHandlerConfig[])
    this.loadCommandHandlers(commands)
  }

  private loadEventHandlers(handlers: EventHandlerConfig[]) {
    console.info('[HANDLER] Setting up event handlers ...')

    for (const handler of handlers) {
      if (handler.once) {
        this.client.once(handler.eventName, (...arguments_) =>
          handler.execute(this.createBotContext(), ...arguments_),
        )
      } else {
        this.client.on(handler.eventName, (...arguments_) =>
          handler.execute(this.createBotContext(), ...arguments_),
        )
      }
    }
  }

  private loadCommandHandlers(handlers: CommandHandlerConfig[]) {
    for (const handler of handlers) {
      this.commands.set(handler.data.name, handler)
    }
  }
}
