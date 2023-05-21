import { Events } from 'discord.js'

import { StickyMessage } from '@prisma/client'

import {
  isNeedToUpdateMessage,
  pushMessageToBottom,
} from '../features/stickyMessage/index.js'
import { isChannelLock } from '../features/stickyMessage/lockChannel.js'
import { incCounter } from '../features/stickyMessage/messageCounter.js'
import { defineEventHandler } from '../types/defineEventHandler.js'
import { getCache } from '../utils/cache.js'

export default defineEventHandler({
  eventName: Events.MessageCreate,
  once: false,
  execute: async (_botContext, message) => {
    const stickyMessage = getCache(
      `sticky-${message.channelId}`,
    ) as StickyMessage

    // if message doesn't need to update -> increase message counter
    if (!stickyMessage || !isNeedToUpdateMessage(message.channelId)) {
      incCounter(message.channelId)
      return
    }

    // if message is already updated -> do nothing
    if (isChannelLock(message.channelId)) {
      return
    }

    // if message need to update -> push sticky message to bottom
    try {
      await pushMessageToBottom(message, stickyMessage)
    } catch (err) {
      console.error(
        `error while update sticky message ${(err as Error).message}`,
      )
    }
  },
})
