import { Message, MessageCreateOptions } from 'discord.js'

/**
 * Sends a direct message (DM) to the author of a message if they have enabled DMs.
 *
 * @param {Message} message - The original message object.
 * @param {MessageCreateOptions} payload - The payload of the message to be sent.
 */
export function sendDm(message: Message, payload: MessageCreateOptions): void {
  if (message.author.dmChannel) {
    message.author.send(payload)
  }
}
