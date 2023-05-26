import { ApplicationCommandData } from 'discord.js'

import { CommandExecutor } from './CommandExecutor'

export interface CommandConfig {
  /**
   * Command data to register with Discord.
   */
  data: ApplicationCommandData

  /**
   * According to Discord’s API, a bot must respond to a slash command
   * within 3 seconds. Otherwise, the interaction time out and the user
   * will see an “interaction failed” message.
   *
   * To work around this, the bot can defer the reply for up to 15 minutes
   * by calling `interaction.deferReply`. This will display a “bot is
   * thinking” message to the user.
   *
   * To make implementing commands easier, by default, the bot will
   * automatically call `interaction.deferReply` for you before it calls
   * the `execute` function. When enabled, your `execute` function should
   * use `interaction.editReply` to send the reply.
   *
   * However, this will prevent you from using `interaction.showModal`.
   * If you want to display a modal, you must disable auto-reply by
   * setting this to `true`.
   *
   * When auto-deferReply is disabled, you must create a reply yourself.
   */
  disableAutoDeferReply?: boolean

  /**
   * Whether the command’s reply should be ephemeral (hidden from other users).
   * This only works if `disableAutoReply` is `false`.
   */
  ephemeral?: boolean

  /**
   * The function to execute when the command is invoked.
   */
  execute: CommandExecutor
}
