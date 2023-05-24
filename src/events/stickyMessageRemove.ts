import { Events } from 'discord.js'

import { prisma } from '@/prisma.js'
import { getCache, removeCache } from '@/utils/cache.js'
import { StickyMessage } from '@prisma/client'

import { STICKY_CACHE_PREFIX } from '../features/stickyMessage/index.js'
import { defineEventHandler } from '../types/defineEventHandler.js'

export default defineEventHandler({
  eventName: Events.MessageCreate,
  once: false,
  execute: async (botContext, message) => {
    if (!message.content.startsWith('?stickao-remove')) {
      return
    }

    const { client } = botContext

    try {
      // Retrieve the sticky message with the specified order from the database
      const stickyMessage = getCache(
        `${STICKY_CACHE_PREFIX}-${message.channelId}`,
      ) as StickyMessage

      // If the sticky message exists, remove it from the database
      if (stickyMessage) {
        await prisma.stickyMessage.delete({
          where: {
            channelId: message.channelId,
          },
        })
        removeCache(`${STICKY_CACHE_PREFIX}-${message.channelId}`)
        console.info(`Sticky message removed: ${stickyMessage.message}`)
        client.user?.send({
          content: 'Successfully removed the sticky message.',
        })
      } else {
        client.user?.send({
          content: 'Not found message in this channel',
        })
      }
    } catch (error) {
      console.error(
        `Error removing sticky message: ${(error as Error).message}`,
      )
      client.user?.send({
        content: 'An error occurred while removing the sticky message.',
      })
    } finally {
      await message.delete()
    }
  },
})
