import {
  Client,
  Collection,
  Events,
  IntentsBitField,
  Interaction,
} from 'discord.js'

import { randomBytes } from 'node:crypto'

import { Environment } from './config'
import featurePlugins from './features'
import { initStickyMessage } from './features/stickyMessage/stickyMessages'
import { BotContext } from './types/BotContext'
import { CommandConfig } from './types/CommandConfig'
import { Plugin } from './types/Plugin'
import { RuntimeConfiguration } from './utils/RuntimeConfiguration'

export class Bot {
  private nextContextId = Number.parseInt(randomBytes(3).toString('hex'), 16)

  public readonly client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ],
  })
  private readonly runtimeConfiguration = new RuntimeConfiguration()
  private readonly commands = new Collection<string, CommandConfig>()
  private readonly isProduction = process.env.NODE_ENV === 'production'

  private createBotContext(logPrefixes: string[]): BotContext {
    const contextId = (this.nextContextId++ & 0xff_ff_ff)
      .toString(16)
      .padStart(6, '0')
    const prefix = [`${contextId} |`, ...logPrefixes].join(' ')
    return {
      client: this.client,
      runtimeConfiguration: this.runtimeConfiguration,
      log: {
        info: (message: string) => console.info(`${prefix} ${message}`),
        error: (message: string, error?: unknown) =>
          console.error(`${prefix} ${message}`, error),
      },
    }
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
    this.client.once(Events.ClientReady, () => this.onReady())
    this.client.on(Events.InteractionCreate, (interaction) =>
      this.onInteractionCreate(interaction),
    )
    this.loadPlugins(featurePlugins)
  }

  private loadPlugins(plugins: Plugin[]) {
    console.info('[PLUGIN] Initializing plugins...')

    for (const plugin of plugins) {
      this.initializePlugin(plugin)
    }
  }

  private initializePlugin(plugin: Plugin) {
    const logPrefix = [`[plugin=${plugin.name}]`]
    plugin.setup({
      addCommand: (handler) => {
        this.commands.set(handler.data.name, handler)
      },
      addEventHandler: (handler) => {
        const logPrefixes = [...logPrefix, `[event=${handler.eventName}]`]
        if (handler.once) {
          this.client.once(handler.eventName, (...arguments_) =>
            handler.execute(this.createBotContext(logPrefixes), ...arguments_),
          )
        } else {
          this.client.on(handler.eventName, (...arguments_) =>
            handler.execute(this.createBotContext(logPrefixes), ...arguments_),
          )
        }
      },
    })
    console.log(`[PLUGIN] Initialized`, plugin.name)
  }

  private async onReady() {
    const { client, commands } = this
    console.log(`[READY] Now online as ${client.user?.tag}.`)
    const commands_data = [...commands.values()].map((command) => command.data)

    // Set guild commands
    try {
      const guild = client.guilds.cache.get(Environment.GUILD_ID)
      if (!guild) {
        throw new Error(`Guild ${Environment.GUILD_ID} not found`)
      }
      await guild.commands.set(commands_data)
      console.info(
        `[READY] ${commands.size} guild commands registered on ${guild.name}`,
      )
    } catch (error) {
      console.error('[READY] Unable to set guild commands:', error)
    }

    // Clear global commands
    try {
      const commands = await client.application?.commands.fetch()
      for (const command of commands?.values() || []) {
        await command.delete()
        console.info(`[READY] Deleted global command ${command.name}`)
      }
    } catch (error) {
      console.error('[READY] Unable to clear application commands:', error)
    }
  }

  private async onInteractionCreate(interaction: Interaction) {
    const { commands } = this
    if (interaction.isCommand()) {
      const commandName = interaction.commandName
      const command = commands.get(commandName)
      if (!command) return
      const botContext = this.createBotContext([`[command="${commandName}"]`])
      try {
        if (!command.disableAutoDeferReply) {
          await interaction.deferReply({ ephemeral: command.ephemeral })
        }
      } catch (error) {
        botContext.log.error(`Unable to defer reply`, error)
        return
      }
      const started = Date.now()
      const user = interaction.user
      botContext.log.info(`Invoked by ${user.tag} (${user.id})`)
      try {
        await command.execute(botContext, interaction)
        const time = Date.now() - started
        botContext.log.info(`Finished in ${time}ms`)
      } catch (error) {
        const time = Date.now() - started
        botContext.log.error(`Failed in ${time}ms`, error)
        if (!command.disableAutoDeferReply) await interaction.deleteReply()
      }
    }
  }
}
