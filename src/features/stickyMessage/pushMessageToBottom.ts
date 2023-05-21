import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'

import { prisma } from '../../prisma.js'
import { saveCache } from '../../utils/cache.js'

import { lockChannel, unlockChannel } from './lockChannel.js'
import { resetCooldown, resetCounter } from './messageCooldown.js'

export async function pushMessageToBottom(
  message: Message,
  stickyMessage: StickyMessage,
): Promise<void> {
  // lock channel
  lockChannel(message.channelId)

  // get old message for delete
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

  // save new message to cache and reset everything
  saveCache(`sticky-${message.channelId}`, updatedMessage)
  resetCounter(message.channelId)
  unlockChannel(message.channelId)
  resetCooldown(newMessage, updatedMessage)
}
