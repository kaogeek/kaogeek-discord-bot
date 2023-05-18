import { Events } from 'discord.js'

import { EventHandlerConfig } from '../types/EventHandlerConfig'
import isOnlyEmoji from '../utils/isOnlyEmoji'

export default {
  eventName: Events.MessageCreate,
  once: false,
  execute: async (client, message) => {
    // if has only emoji -> delete message
    if (isOnlyEmoji(message.content)) {
      try {
        await message.delete()
      } catch (err) {
        console.error(err)
      }
    }
  },
} satisfies EventHandlerConfig<Events.MessageCreate>
