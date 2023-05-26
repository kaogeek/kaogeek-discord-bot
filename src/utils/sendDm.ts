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
  // Check if a DM channel with the user does not exist
  if (!message.author.dmChannel) {
    try {
      // Try to create a DM channel with the user
      await message.author.createDM()
    } catch (error) {
      // Handle the case where the user has disabled DMs
      if (error instanceof DiscordAPIError && error.code === 50_007) {
        console.warn('user not enable permission to send private message')
      } else {
        console.error(error)
        return
      }
    }

    // At this point, a DM channel with the user either already existed, or has just been created
    try {
      // Try to send the message
      await message.author.send(payload)
    } catch (error) {
      // Handle the case when users change their minds to disable DMs
      if (error instanceof DiscordAPIError && error.code === 50_007) {
        console.warn('user not enable permission to send private message')
      } else {
        // Log any other errors
        console.error(error)
      }
    }
    return
  }
}
