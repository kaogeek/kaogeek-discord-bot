import { Client, Collection, IntentsBitField } from 'discord.js'

import { globSync } from 'glob'
import path from 'path'

import { Environment } from './config.js'
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

  async init() {
    console.info(`[ENV] ${this.isProduction ? 'Production' : 'Development'}`)
    await this.handler()

    void this.login(Environment.BOT_TOKEN)
  }

  async handler() {
    console.info('[HANDLER] Loading...')
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
    void this.handleEvents(eventFiles)
    void this.handleCommands(commandFolders)
    return Promise.resolve(true)
  }

  async handleEvents(eventFiles: string[]) {
    for (const file of eventFiles) {
      if (!file[0].startsWith('-')) {
        try {
          const eventHandlerConfig = await import(`file:///${file}`).then(
            ({ default: defaultExport }) => defaultExport,
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

  async handleCommands(commandFiles: string[] = []) {
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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Dictionary<V = any, K extends string | symbol = string> = Record<K, V>
}

void new Bot().init()
