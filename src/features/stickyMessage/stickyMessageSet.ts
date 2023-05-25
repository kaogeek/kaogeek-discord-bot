import {
  ChannelType,
  Message,
  PermissionsBitField,
  TextChannel,
} from 'discord.js'

import { StickyMessage } from '@prisma/client'

import { prisma } from '@/prisma'
import { getCache, saveCache } from '@/utils/cache'
import { sendDm } from '@/utils/sendDm'

import { STICKY_CACHE_PREFIX } from './stickyMessages'

export async function stickyMessageSet(message: Message) {
  if (!message.content.startsWith('?stickao-set')) {
    return
  }

  // Check if it is a text channel
  const channel = message.channel
  if (channel?.type !== ChannelType.GuildText) {
    await sendDm(message, {
      content: 'Sticky text can only be created in a text channel.',
    })
    await message.delete()
    return
  }

  // Check if the user has the 'MANAGE_MESSAGES' permission
  const authorPermissions = channel.permissionsFor(message.author)
  if (!authorPermissions?.has(PermissionsBitField.Flags.ManageMessages)) {
    await sendDm(message, {
      content:
        'You must have the `Manage Messages` permission to use this command.',
    })
    await message.delete()
    return
  }

  // Get content from the message
  const messageContent = message.content.replace('?stickao-set', '').trim()

  if (!messageContent) {
    await sendDm(message, {
      content: 'Please provide a valid message content for Stickao Message.',
    })
    await message.delete()
    return
  }

  try {
    const oldStickyMessage = getCache(
      `${STICKY_CACHE_PREFIX}-${message.channelId}`,
    ) as StickyMessage

    if (oldStickyMessage) {
      const oldMessage = await message.channel.messages.fetch(
        oldStickyMessage.messageId,
      )
      await oldMessage.delete()
    }

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
    await sendDm(message, {
      content: 'Successfully created sticky message.',
    })
  } catch (error) {
    console.error(`Error creating sticky message: ${(error as Error).message}`)
    await sendDm(message, {
      content: 'An error occurred while creating the sticky message.',
    })
  } finally {
    await message.delete()
  }
}
