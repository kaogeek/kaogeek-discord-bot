import { Events } from 'discord.js'

import { EventHandlerConfig } from '../types/EventHandlerConfig'

const emojiRegex = /<a?:\w+:\d+>/g

export default {
  eventName: Events.MessageCreate,
  once: false,
  execute: async (client, message) => {
    const emoji = message.content.match(emojiRegex)

    // if has only emoji -> delete message
    if (emoji && emoji.join('') === message.content) {
      try {
        message.delete()
      } catch (err) {
        console.error(err)
      }
    }
  },
} satisfies EventHandlerConfig<Events.MessageCreate>
