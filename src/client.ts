import { Client, Collection, IntentsBitField } from 'discord.js'

import { Environment } from '@/config'
import { readdirSync } from 'fs'

import {
  validateCommandHandlerConfig,
  validateEventHandlerConfig,
} from './utils/validate-handler-config'

export default class Bot extends Client {
  public commands: Collection<string, Dictionary>
  public commandArray: Dictionary[]

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
    this.commandArray = []
  }

  async init() {
    await this.handler()
    void this.login(Environment.BOT_TOKEN)
  }

  async handler() {
    const eventFiles = readdirSync(`/${__dirname}/events`).filter((file) =>
      file.endsWith('.js')
    )
    const commandFolders = readdirSync(`/${__dirname}/commands`).filter(
      (file) => file.endsWith('.js')
    )

    void this.handleEvents(eventFiles, './events')
    void this.handleCommands(commandFolders, './commands')
  }

  async handleEvents(eventFiles: string[], path: string) {
    for (const file of eventFiles) {
      if (!file[0].startsWith('-')) {
        try {
          const eventHandlerConfig = await import(`${path}/${file}`).then(
            ({ default: defaultExport }) => defaultExport
          )

          if (validateEventHandlerConfig(eventHandlerConfig)) {
            if (eventHandlerConfig.once) {
              this.once(eventHandlerConfig.eventName, (...args) =>
                eventHandlerConfig.execute(this, ...args)
              )
            } else {
              this.on(eventHandlerConfig.eventName, (...args) =>
                eventHandlerConfig.execute(this, ...args)
              )
            }
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
  }

  async handleCommands(commandFolders: string[] = [], path: string) {
    for (const folder of commandFolders) {
      const commandFiles = readdirSync(`${path}/${folder}`).filter((file) =>
        file.endsWith('.js')
      )

      for (const file of commandFiles) {
        if (!file[0].startsWith('-')) {
          const commandHandlerConfig = await import(
            `${path}/${folder}/${file}`
          ).then(({ default: defaultExport }) => defaultExport)

          if (validateCommandHandlerConfig(commandHandlerConfig)) {
            this.commands.set(
              commandHandlerConfig.command,
              commandHandlerConfig
            )
            this.commandArray.push(commandHandlerConfig)
          }
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
