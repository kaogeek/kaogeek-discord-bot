import { ApplicationCommandData } from 'discord.js'

import { CommandHandlerExecutor } from './CommandHandlerExecutor.js'

export interface CommandHandlerConfig {
  /**
   * Command data to register with Discord.
   */
  data: ApplicationCommandData

  /**
   * A Discord bot must respond to a slash command within 3 seconds.
   * To make implementing commands easier, by default, the bot will
   * automatically reply with a "thinking" message before invoking
   * the `execute` function, allowing you to call `interaction.editReply`
   * later on.
   *
   * However, this will prevent you from using `interaction.showModal`.
   * If you want to display a modal, you must disable auto-reply by
   * setting this to `true`.
   *
   * When auto-reply is disabled, you must create a reply yourself.
   */
  disableAutoReply?: boolean

  /**
   * Whether the command’s reply should be ephemeral (hidden from other users).
   * This only works if `disableAutoReply` is `false`.
   */
  ephemeral?: boolean

  /**
   * The function to execute when the command is invoked.
   */
  execute: CommandHandlerExecutor
}
