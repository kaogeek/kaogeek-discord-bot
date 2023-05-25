import { Client, Collection, IntentsBitField } from 'discord.js'

import commands from './commands/index'
import { Environment } from './config'
import eventPlugins from './events/index'
import featurePlugins from './features'
import { initStickyMessage } from './features/stickyMessage/stickyMessages'
import { BotContext } from './types/BotContext'
import { CommandHandlerConfig } from './types/CommandHandlerConfig'
import { Plugin } from './types/Plugin'
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
    await initStickyMessage()

    const initialRuntimeConfig = await this.runtimeConfiguration.init()
    console.info('[CONFIG] Runtime configuration loaded', initialRuntimeConfig)

    await this.client.login(Environment.BOT_TOKEN)
  }

  loadHandlers() {
    this.loadPlugins([...eventPlugins, ...featurePlugins])
    this.loadCommandHandlers(commands)
  }

  private loadPlugins(plugins: Plugin[]) {
    console.info('[PLUGIN] Initializing plugins...')

    for (const plugin of plugins) {
      this.initializePlugin(plugin)
    }
  }

  private initializePlugin(plugin: Plugin) {
    plugin.setup({
      addEventHandler: (handler) => {
        if (handler.once) {
          this.client.once(handler.eventName, (...arguments_) =>
            handler.execute(this.createBotContext(), ...arguments_),
          )
        } else {
          this.client.on(handler.eventName, (...arguments_) =>
            handler.execute(this.createBotContext(), ...arguments_),
          )
        }
      },
    })
    console.log(`[PLUGIN] Initialized`, plugin.name)
  }

  private loadCommandHandlers(handlers: CommandHandlerConfig[]) {
    for (const handler of handlers) {
      this.commands.set(handler.data.name, handler)
    }
  }
}
