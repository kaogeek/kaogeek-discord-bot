import { Events } from 'discord.js'

import { isChannelLock } from '@/features/stickyMessage/channelLock'
import {
  STICKY_CACHE_PREFIX,
  isNeedToUpdateMessage,
  pushMessageToBottom,
} from '@/features/stickyMessage/index'
import { incCounter } from '@/features/stickyMessage/messageCounter'
import { defineEventHandler } from '@/types/defineEventHandler'
import { getCache } from '@/utils/cache'
import { StickyMessage } from '@prisma/client'

export default defineEventHandler({
  eventName: Events.MessageCreate,
  once: false,
  execute: async (_botContext, message) => {
    const stickyMessage = getCache(
      `${STICKY_CACHE_PREFIX}-${message.channelId}`,
    ) as StickyMessage

    // if channel not has any sticky message -> do nothing
    if (!stickyMessage) {
      return
    }

    // if message doesn't need to update -> increase message counter
    if (!isNeedToUpdateMessage(message.channelId)) {
      incCounter(message.channelId)
      return
    }

    // if message is updating -> do nothing
    if (isChannelLock(message.channelId)) {
      return
    }

    // if message need to update -> push sticky message to bottom
    await pushMessageToBottom(message, stickyMessage)
  },
})
