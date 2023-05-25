import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'

import { Environment } from '@/config'
import { getCache, saveCache } from '@/utils/cache'

import { getCounter } from './messageCounter'
import { STICKY_COOLDOWN_PREFIX, pushMessageToBottom } from './stickyMessages'

const channelCooldown: Map<string, NodeJS.Timeout> = new Map()

/**
 * Set the channel status to cooldown
 *
 * @param {string} channelId - the id of channel that want to lock
 *
 */
function cooldown(channelId: string): void {
  saveCache(`${STICKY_COOLDOWN_PREFIX}-${channelId}`, true)
}

/**
 * Set the channel status to available
 *
 * @param {string} channelId - the id of channel that want to unlock
 *
 */
function available(channelId: string): void {
  saveCache(`${STICKY_COOLDOWN_PREFIX}-${channelId}`, false)
}

/**
 * Check the channel status is lock
 *
 * @param {string} channelId - the id of channel that want to check
 * @returns cooldown status (default) if available flag is true return channel available status
 *
 */
export function isCooldown(channelId: string): boolean {
  return getCache(`${STICKY_COOLDOWN_PREFIX}-${channelId}`) === true
}

/**
 * Set the cooldown of the channel.
 *
 * @param {Message} message - The message object associated with the channel.
 * @param {StickyMessage} stickyMessage - The sticky message associated with the channel.
 * @returns {Promise<void>} A Promise that resolves once the cooldown is set.
 */

export async function resetCooldown(
  message: Message,
  stickyMessage: StickyMessage,
): Promise<void> {
  // mark channel is cooldown
  cooldown(message.channelId)

  const timeout = channelCooldown.get(message.channelId)

  // is has saved timeout -> clear it
  if (timeout) {
    clearTimeout(timeout)
  }

  const timeoutId = setTimeout(() => {
    // mark channel is available
    available(message.channelId)
    if (getCounter(message.channelId) > 1) {
      pushMessageToBottom(message, stickyMessage)
    }
  }, Environment.MESSAGE_COOLDOWN_SEC * 1000)

  channelCooldown.set(message.channelId, timeoutId)
}
