import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'

import { getCache } from '@/utils/cache'

import { isChannelLock } from './channelLock'
import { incCounter } from './messageCounter'
import {
  STICKY_CACHE_PREFIX,
  isNeedToUpdateMessage,
  pushMessageToBottom,
} from './stickyMessages'

export async function stickyMessageHandler(message: Message) {
  // TODO: fix this to handle the command dynamically
  if (
    message.content.startsWith('?stickao-set') ||
    message.content.startsWith('?stickao-remove')
  ) {
    return
  }

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
}
