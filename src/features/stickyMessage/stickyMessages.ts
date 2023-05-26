import { DiscordAPIError, Message, MessageFlags } from 'discord.js'

import { StickyMessage } from '@prisma/client'

import { Environment } from '@/config'
import { prisma } from '@/prisma'
import { saveCache } from '@/utils/cache'

import { lockChannel, unlockChannel } from './channelLock'
import { isCooldown, resetCooldown } from './messageCooldown'
import { getCounter, resetCounter } from './messageCounter'

export const STICKY_LOCK_PREFIX = 'sticky-lock'
export const STICKY_COOLDOWN_PREFIX = 'sticky-cooldown'
export const STICKY_CACHE_PREFIX = 'sticky-cache'
export const STICKY_MODAL_TIMEOUT = 60_000

/**
 *  Init sticky message memory cache
 */
export async function initStickyMessage() {
  const messages = await prisma.stickyMessage.findMany()
  for (const message of messages) {
    saveCache(`${STICKY_CACHE_PREFIX}-${message.channelId}`, message)
    resetCounter(message.channelId)
  }
}

/**
 * Pushes the sticky message to the bottom of the channel.
 *
 * @param {Message} message - The message object representing the triggering message.
 * @param {StickyMessage} stickyMessage - The sticky message to be pushed to the bottom of the channel.
 * @returns {Promise<void>} A promise that resolves when the sticky message is successfully pushed to the bottom.
 */
export async function pushMessageToBottom(
  message: Message,
  stickyMessage: StickyMessage,
): Promise<void> {
  // lock channel
  lockChannel(message.channelId)

  try {
    // get old message for delete
    const oldMessage = await message.channel.messages.fetch(
      stickyMessage.messageId,
    )

    await oldMessage.delete()

    const newMessage = await message.channel.send({
      content: stickyMessage.message,
      flags: MessageFlags.SuppressNotifications,
    })

    // update sticky message with new when successfully send new message
    const stickyMessageEntity = await prisma.stickyMessage.update({
      data: {
        messageId: newMessage.id,
      },
      where: {
        channelId: message.channelId,
      },
    })

    // save new message to cache and reset cooldown
    saveCache(
      `${STICKY_CACHE_PREFIX}-${message.channelId}`,
      stickyMessageEntity,
    )
    //!! if error occur cooldown may not reset
    resetCooldown(newMessage, stickyMessageEntity)
  } catch (error) {
    // in case of msg already delete at stickyMessageSet so tell cleary to console
    if (error instanceof DiscordAPIError && error.code === 10_008) {
      console.error(`[StickyMessage] already delete old message!`)
    } else {
      console.error(
        `error while update sticky message ${(error as Error).message}`,
      )
    }
  } finally {
    resetCounter(message.channelId)
    unlockChannel(message.channelId)
  }
}

/**
 * Check if it is necessary to update the sticky message at the bottom of the channel.
 *
 * @param {string} channelId - The ID of the channel to check.
 * @returns `true` if the conditions for updating the message are met, otherwise `false`.
 *
 */
export function isNeedToUpdateMessage(channelId: string): boolean {
  return (
    !isCooldown(channelId) || getCounter(channelId) >= Environment.MESSAGE_MAX
  )
}
