import { Events, PermissionsBitField, TextChannel } from 'discord.js'

import { STICKY_CACHE_PREFIX } from '@/features/stickyMessage/index'
import { prisma } from '@/prisma'
import { defineEventHandler } from '@/types/defineEventHandler'
import { getCache, removeCache } from '@/utils/cache'
import { StickyMessage } from '@prisma/client'

export default defineEventHandler({
  eventName: Events.MessageCreate,
  once: false,
  execute: async (_botContext, message) => {
    if (!message.content.startsWith('?stickao-remove')) {
      return
    }

    // Check if the user has the 'MANAGE_MESSAGES' permission
    const authorPermissions = (message.channel as TextChannel).permissionsFor(
      message.author,
    )
    if (!authorPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
      message.author.send({
        content:
          'You must have the "Manage Messages" permission to use this command.',
      })
      return
    }

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
        message.author.send({
          content: 'Successfully removed the sticky message.',
        })
      } else {
        message.author.send({
          content: 'Not found message in this channel',
        })
      }
    } catch (error) {
      console.error(
        `Error removing sticky message: ${(error as Error).message}`,
      )
      message.author.send({
        content: 'An error occurred while removing the sticky message.',
      })
    } finally {
      await message.delete()
    }
  },
})
