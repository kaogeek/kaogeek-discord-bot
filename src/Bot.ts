import { Client, Collection, IntentsBitField } from 'discord.js'

import commands from './commands/index.js'
import { Environment } from './config.js'
import events from './events/index.js'
import { BotContext } from './types/BotContext.js'
import { CommandHandlerConfig } from './types/CommandHandlerConfig.js'
import { EventHandlerConfig } from './types/EventHandlerConfig.js'
import { RuntimeConfiguration } from './utils/RuntimeConfiguration.js'

export class Bot {
  public readonly client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.GuildVoiceStates,
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
        this.client.once(handler.eventName, (...args) =>
          handler.execute(this.createBotContext(), ...args),
        )
      } else {
        this.client.on(handler.eventName, (...args) =>
          handler.execute(this.createBotContext(), ...args),
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
