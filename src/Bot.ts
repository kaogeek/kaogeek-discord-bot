import {
  Client,
  ClientEvents,
  Collection,
  Events,
  IntentsBitField,
  Interaction,
} from 'discord.js'

import { randomBytes } from 'node:crypto'

import { Environment } from './config'
import featurePlugins from './features'
import { BotContext } from './types/BotContext'
import { CommandConfig } from './types/CommandConfig'
import { Logger } from './types/Logger'
import { Plugin } from './types/Plugin'
import { RuntimeConfiguration } from './utils/RuntimeConfiguration'
import { createLogger } from './utils/createLogger'

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
    return {
      client: this.client,
      runtimeConfiguration: this.runtimeConfiguration,
      log: this.createNewLogger(logPrefixes),
    }
  }

  private createNewLogger(
    prefixes: string[],
    contextId = this.getNextContextId(),
  ) {
    return createLogger([`${contextId} |`, ...prefixes].join(' '))
  }

  private getNextContextId() {
    return (this.nextContextId++ & 0xff_ff_ff).toString(16).padStart(6, '0')
  }

  async initAndStart() {
    await this.init()
    await this.client.login(Environment.BOT_TOKEN)
  }

  async init() {
    const log = this.createNewLogger(['[Bot.init]'])
    log.info(`Environment: ${this.isProduction ? 'Production' : 'Development'}`)

    this.client.once(Events.ClientReady, () => this.onReady())
    this.client.on(Events.InteractionCreate, (interaction) =>
      this.onInteractionCreate(interaction),
    )
    this.loadPlugins(featurePlugins)

    const initialRuntimeConfig = await this.runtimeConfiguration.init()
    log.info(
      'Initial runtime configuration: ' + JSON.stringify(initialRuntimeConfig),
    )
  }

  private async loadPlugins(plugins: Plugin[]) {
    const log = this.createNewLogger(['[Bot.loadPlugins]'])
    log.info('[PLUGIN] Setting up plugins...')

    let initializers: (() => Promise<void>)[] | undefined = []
    for (const plugin of plugins) {
      const addInitializer = (init: () => Promise<void>) => {
        if (!initializers) {
          throw new Error(
            `addInitializer() must be called synchronously in the plugin’s setup() (plugin: ${plugin.name})`,
          )
        }
        initializers.push(init)
      }
      this.initPlugin(plugin, addInitializer, log)
    }

    const collectedInitializers = initializers
    initializers = undefined

    log.info('[PLUGIN] Running plugin initializers...')
    await Promise.all(collectedInitializers.map((init) => init()))
  }

  private initPlugin(
    plugin: Plugin,
    addInitializer: (init: () => Promise<void>) => void,
    log: Logger,
  ) {
    const logPrefix = `[plugin=${plugin.name}]`
    plugin.setup({
      addCommand: (handler) => {
        this.commands.set(handler.data.name, handler)
      },
      addEventHandler: (handler) => {
        const logPrefixes = [logPrefix, `[event=${handler.eventName}]`]
        const listener = async (
          ...arguments_: ClientEvents[typeof handler.eventName]
        ) => {
          const botContext = this.createBotContext(logPrefixes)
          try {
            await handler.execute(botContext, ...arguments_)
          } catch (error) {
            botContext.log.error('Error in event handler', error)
          }
        }
        if (handler.once) {
          this.client.once(handler.eventName, listener)
        } else {
          this.client.on(handler.eventName, listener)
        }
      },
      addInitializer: (init) => {
        addInitializer(async () => {
          const logPrefixes = [logPrefix, `[initializer]`]
          return init(this.createBotContext(logPrefixes))
        })
      },
    })
    log.info(`Initialized ${plugin.name}`)
  }

  private async onReady() {
    const { client, commands } = this
    const log = this.createNewLogger(['[Bot.onReady]'])
    log.info(`Now online as ${client.user?.tag}.`)
    const commands_data = [...commands.values()].map((command) => command.data)

    // Set guild commands
    try {
      const guild = client.guilds.cache.get(Environment.GUILD_ID)
      if (!guild) {
        throw new Error(`Guild ${Environment.GUILD_ID} not found`)
      }
      await guild.commands.set(commands_data)
      log.info(`${commands.size} guild commands registered on ${guild.name}`)
    } catch (error) {
      console.error('Unable to set guild commands:', error)
    }

    // Clear global commands
    try {
      const commands = await client.application?.commands.fetch()
      for (const command of commands?.values() || []) {
        await command.delete()
        console.info(`Deleted global command ${command.name}`)
      }
    } catch (error) {
      console.error('Unable to clear application commands:', error)
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
