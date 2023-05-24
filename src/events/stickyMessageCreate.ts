import { ChannelType, Events, TextChannel } from 'discord.js'

import { prisma } from '@/prisma.js'

import { STICKY_CACHE_PREFIX } from '../features/stickyMessage/index.js'
import { defineEventHandler } from '../types/defineEventHandler.js'
import { saveCache } from '../utils/cache.js'

export default defineEventHandler({
  eventName: Events.MessageCreate,
  once: false,
  execute: async (botContext, message) => {
    if (!message.content.startsWith('?stickao-create')) {
      return
    }

    const { client } = botContext

    // check is the text channel
    const channel = client.channels.cache.get(message.channelId)
    if (channel?.type !== ChannelType.GuildText) {
      client.user?.send({
        content: 'Sticky text can create only in text channel.',
      })
      return
    }

    //get content from modal
    const messageContent = message.content.split('?stickao-create ').pop()

    if (!messageContent) {
      client.user?.send({
        content: 'Please provide the valid message content for Stickao Message',
      })
      return
    }

    try {
      // send message
      const sentMessage = await (channel as unknown as TextChannel).send({
        content: messageContent,
      })

      // save message
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

      // successfully create sticky message
      console.info(`Sticky message saved: ${messageContent}`)
      client.user?.send({
        content: 'Successfully created sticky message.',
      })
    } catch (error) {
      console.error(
        `Error creating sticky message: ${(error as Error).message}`,
      )
      client.user?.send({
        content: 'An error occurred while creating the sticky message.',
      })
    } finally {
      await message.delete()
    }
  },
})
