import type Bot from '../client'

export type CommandHandlerExecutor = (client: Bot) => void

export interface CommandHandlerConfig {
  command: string
  execute: CommandHandlerExecutor
}
