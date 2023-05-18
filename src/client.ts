import { Client, Collection, IntentsBitField } from 'discord.js'

import { globSync } from 'glob'
import path from 'path'

import { Environment } from './config.js'
import { prisma } from './prisma.js'
import { CommandHandlerConfig } from './types/CommandHandlerConfig.js'
import {
  validateCommandHandlerConfig,
  validateEventHandlerConfig,
} from './utils/validate-handler-config.js'

export default class Bot extends Client {
  public commands: Collection<string, CommandHandlerConfig>
  public isProduction = process.env.NODE_ENV === 'production'
  public __dirname =
    process.env.NODE_ENV === 'production'
      ? path.resolve('./dist')
      : path.resolve('./src')

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
    await this.loadHandlers()

    this.login(Environment.BOT_TOKEN)
  }

  async loadHandlers() {
    console.info('[HANDLER] Loading events and commands ...')
    const eventFiles = globSync('events/*.{js,ts}', {
      cwd: this.__dirname,
      root: this.__dirname,
      absolute: true,
    })
    const commandFolders = globSync('commands/**/*.{js,ts}', {
      cwd: this.__dirname,
      root: this.__dirname,
      absolute: true,
    })

    this.loadEventHandlers(eventFiles)
    this.loadCommandHandlers(commandFolders)
  }

  async loadEventHandlers(eventFiles: string[]) {
    for (const file of eventFiles) {
      if (!file[0].startsWith('-')) {
        try {
          const eventHandlerConfig = await import(`file:///${file}`).then(
            (module) => module.default,
          )

          console.info(`[EVENT] "${eventHandlerConfig.eventName}" => "${file}"`)
          if (validateEventHandlerConfig(eventHandlerConfig)) {
            if (eventHandlerConfig.once) {
              this.once(eventHandlerConfig.eventName, (...args) =>
                eventHandlerConfig.execute(this, ...args),
              )
            } else {
              this.on(eventHandlerConfig.eventName, (...args) =>
                eventHandlerConfig.execute(this, ...args),
              )
            }
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
  }

  async loadCommandHandlers(commandFiles: string[] = []) {
    for (const cmdfile of commandFiles) {
      if (!cmdfile[0].startsWith('-')) {
        try {
          const commandHandlerConfig = await import(`file:///${cmdfile}`).then(
            ({ default: defaultExport }) => defaultExport,
          )

          if (validateCommandHandlerConfig(commandHandlerConfig)) {
            console.info(
              `[COMMAND] "${commandHandlerConfig.data.name}" => "${cmdfile}"`,
            )
            this.commands.set(
              commandHandlerConfig.data.name,
              commandHandlerConfig,
            )
          }
        } catch (error) {
          console.log(error)
        }
      }
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
  await new Bot().loadHandlers()
  console.info(`[SMOKE] OK, loading handlers is working!`)
} else {
  // Run the bot
  new Bot().initAndStart()
}
