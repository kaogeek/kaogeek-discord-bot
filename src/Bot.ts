import {
  Client,
  Collection,
  Events,
  IntentsBitField,
  Interaction,
} from 'discord.js'

import { Environment } from './config'
import featurePlugins from './features'
import { initStickyMessage } from './features/stickyMessage/stickyMessages'
import { BotContext } from './types/BotContext'
import { CommandConfig } from './types/CommandConfig'
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
  private readonly commands = new Collection<string, CommandConfig>()
  private readonly isProduction = process.env.NODE_ENV === 'production'

  private createBotContext() {
    return {
      client: this.client,
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
    plugin.setup({
      addCommand: (handler) => {
        this.commands.set(handler.data.name, handler)
      },
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
      const botContext = this.createBotContext()
      const commandName = interaction.commandName
      const command = commands.get(commandName)
      if (!command) return
      try {
        if (!command.disableAutoDeferReply) {
          await interaction.deferReply({ ephemeral: command.ephemeral })
        }
      } catch (error) {
        console.error(`[COMMAND: ${commandName}] Unable to defer reply:`, error)
        return
      }
      try {
        console.info(
          `[COMMAND: ${commandName}] Invoked by ${interaction.user.tag} (${interaction.user.id})`,
        )
        await command.execute(botContext, interaction)
      } catch (error) {
        console.error(`[COMMAND: ${commandName}] Unable to execute:`, error)
        if (command.disableAutoDeferReply) return
        await interaction.deleteReply()
      }
    }
  }
}
