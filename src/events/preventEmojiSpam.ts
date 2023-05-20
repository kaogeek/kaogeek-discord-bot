import { Events } from 'discord.js'

import { defineEventHandler } from '../types/defineEventHandler.js'
import isOnlyEmoji from '../utils/isOnlyEmoji.js'

export default defineEventHandler({
  eventName: Events.MessageCreate,
  once: false,
  execute: async (botContext, message) => {
    // if has only emoji -> delete message
    if (isOnlyEmoji(message.content)) {
      try {
        await message.delete()
      } catch (err) {
        console.error(err)
      }
    }
  },
})
