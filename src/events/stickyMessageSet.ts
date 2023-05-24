import {
  ChannelType,
  Events,
  PermissionsBitField,
  TextChannel,
} from 'discord.js'

import { prisma } from '@/prisma.js'

import { STICKY_CACHE_PREFIX } from '../features/stickyMessage/index.js'
import { defineEventHandler } from '../types/defineEventHandler.js'
import { saveCache } from '../utils/cache.js'

export default defineEventHandler({
  eventName: Events.MessageCreate,
  once: false,
  execute: async (_botContext, message) => {
    if (!message.content.startsWith('?stickao-set')) {
      return
    }

    // Check if it is a text channel
    const channel = message.channel
    if (channel?.type !== ChannelType.GuildText) {
      message.author.send({
        content: 'Sticky text can only be created in a text channel.',
      })
      return
    }

    // Check if the user has the 'MANAGE_MESSAGES' permission
    const authorPermissions = channel.permissionsFor(message.author)
    if (!authorPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
      message.author.send({
        content:
          'You must have the "Manage Messages" permission to use this command.',
      })
      return
    }

    // Get content from the message
    const messageContent = message.content.replace('?stickao-set', '').trim()

    if (!messageContent) {
      message.author.send({
        content: 'Please provide a valid message content for Stickao Message.',
      })
      return
    }

    try {
      // Send message
      const sentMessage = await (channel as TextChannel).send({
        content: messageContent,
      })

      // Save message
      const stickyMessage = await prisma.stickyMessage.upsert({
        create: {
          messageId: sentMessage.id,
          channelId: message.channelId,
          message: messageContent,
        },
        update: {
          messageId: sentMessage.id,
          message: messageContent,
        },
        where: {
          channelId: message.channelId,
        },
      })

      saveCache(`${STICKY_CACHE_PREFIX}-${message.channelId}`, stickyMessage)

      // Successfully create sticky message
      console.info(`Sticky message saved: ${messageContent}`)
      message.author.send({
        content: 'Successfully created sticky message.',
      })
    } catch (error) {
      console.error(
        `Error creating sticky message: ${(error as Error).message}`,
      )
      message.author.send({
        content: 'An error occurred while creating the sticky message.',
      })
    } finally {
      await message.delete()
    }
  },
})
