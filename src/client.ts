import { Client, Collection, IntentsBitField } from 'discord.js'

import { globSync } from 'glob'
import path from 'path'

import {
  validateCommandHandlerConfig,
  validateEventHandlerConfig,
} from './utils/validate-handler-config.js'

export default class Bot extends Client {
  public commands: Collection<string, Dictionary>
  public isProduction = process.env.NODE_ENV === 'production'
  public __dirname =
    process.env.NODE_ENV === 'production'
      ? path.resolve('./dist/')
      : path.resolve('./')
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
    await this.handler()
    void this.login(process.env.BOT_TOKEN)
  }

  async handler() {
    const eventFiles = globSync(
      path.resolve(this.__dirname, './src/events/*.{js,ts}'),
    )
    const commandFolders = globSync(
      path.resolve(this.__dirname, './src/commands/**/*.{js,ts}'),
    )
    void this.handleEvents(eventFiles)
    void this.handleCommands(commandFolders)
  }

  async handleEvents(eventFiles: string[]) {
    for (const file of eventFiles) {
      if (!file[0].startsWith('-')) {
        try {
          const eventHandlerConfig = await import(`${file}`).then(
            ({ default: defaultExport }) => defaultExport,
          )

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
          const commandHandlerConfig = await import(`${cmdfile}`).then(
            ({ default: defaultExport }) => defaultExport,
          )

          if (validateCommandHandlerConfig(commandHandlerConfig)) {
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
