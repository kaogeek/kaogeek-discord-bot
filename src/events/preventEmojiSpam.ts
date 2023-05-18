import { Events } from 'discord.js'

import { EventHandlerConfig } from '../types/EventHandlerConfig.js'

const emojiRegex =
  /(<a?(:\w+:\d+)>|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji_Component})\s*/gu

export default {
  eventName: Events.MessageCreate,
  once: false,
  execute: async (client, message) => {
    const emoji = message.content.match(emojiRegex)

    // if has only emoji -> delete message
    if (emoji && emoji.join('').trim() === message.content.trim()) {
      try {
        await message.delete()
      } catch (err) {
        console.error(err)
      }
    }
  },
} satisfies EventHandlerConfig<Events.MessageCreate>
