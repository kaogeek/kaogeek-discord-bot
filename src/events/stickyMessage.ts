import { Events } from 'discord.js'

import { StickyMessage } from '@prisma/client'

import {
  ChannelLockType,
  isChannelLock,
  lockChannel,
  unlockChannel,
} from '../features/stickyMessage/lockChannel.js'
import {
  getCounter,
  incCounter,
  isNeedToUpdateMessage,
  resetCooldown,
  resetCounter,
} from '../features/stickyMessage/messageCooldown.js'
import { prisma } from '../prisma.js'
import { defineEventHandler } from '../types/defineEventHandler.js'
import { getCache, saveCache } from '../utils/cache.js'

export default defineEventHandler({
  eventName: Events.MessageCreate,
  once: false,
  execute: async (_botContext, message) => {
    const stickyMessage = getCache(
      `sticky-${message.channelId}`,
    ) as StickyMessage
    console.debug(stickyMessage)
    console.debug(getCounter(message.channelId))
    console.debug(isChannelLock(message.channelId, ChannelLockType.COOLDOWN))
    console.debug(isChannelLock(message.channelId, ChannelLockType.AVAILABLE))

    // if message need to update -> push sticky message to bottom
    if (stickyMessage && isNeedToUpdateMessage(message.channelId)) {
      if (isChannelLock(message.channelId)) {
        return
      }

      lockChannel(message.channelId)
      resetCooldown(message.channelId)
      try {
        const oldMessage = await message.channel.messages.fetch(
          stickyMessage.messageId,
        )

        await oldMessage.delete()

        const newMessage = await message.channel.send({
          content: stickyMessage.message,
        })

        // update sticky message with new id
        const updatedMessage = await prisma.stickyMessage.update({
          data: {
            messageId: newMessage.id,
          },
          where: {
            channelId: message.channelId,
          },
        })

        saveCache(`sticky-${message.channelId}`, updatedMessage)
        resetCounter(message.channelId)
        unlockChannel(message.channelId)
      } catch (err) {
        console.error(
          `error while update sticky message ${(err as Error).message}`,
        )
      }
    } else {
      incCounter(message.channelId)
    }
  },
})
