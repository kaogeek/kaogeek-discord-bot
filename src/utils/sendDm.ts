import { DiscordAPIError, Message, MessageCreateOptions } from 'discord.js'

/**
 * Sends a direct message (DM) to the author of a message if they have enabled DMs.
 *
 * @param {Message} message - The original message object.
 * @param {MessageCreateOptions} payload - The payload of the message to be sent.
 */
export async function sendDm(
  message: Message,
  payload: MessageCreateOptions,
): Promise<void> {
  if (!message.author.dmChannel) {
    try {
      await message.author.createDM()
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === 50_007) {
        console.warn('user not enable permission to send private message')
      } else {
        console.error(error)
      }
      return
    }
  }

  await message.author.send(payload)
  return
}
