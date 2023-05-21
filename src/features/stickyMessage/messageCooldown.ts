import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'

import { Environment } from '../../config.js'

import {
  ChannelLockType,
  isChannelLock,
  lockChannel,
  unlockChannel,
} from './lockChannel.js'
import { pushMessageToBottom } from './pushMessageToBottom.js'

interface ChannelCounter {
  [channelId: string]: number
}

const messageInChannelCounter: ChannelCounter = {}

/**
 * Increase counter of the message that was sent in the channel
 *
 * @param {string} channelId - the id of channel that message want sent
 *
 */
export function incCounter(channelId: string): void {
  if (!++messageInChannelCounter[channelId]) {
    messageInChannelCounter[channelId] = 1
  }
}

/**
 * Reset the counter
 *
 * @param {string} channelId - the id of channel of counter that want to reset
 *
 */
export function resetCounter(channelId: string): void {
  messageInChannelCounter[channelId] = 1
}

/**
 * Get current message count
 *
 * @param {string} channelId - the id of channel that message want sent
 *
 */
export function getCounter(channelId: string): number {
  return messageInChannelCounter[channelId]
}

interface ChannelCooldown {
  [channelId: string]: NodeJS.Timeout
}

const channelCooldown: ChannelCooldown = {}

export async function startCooldown(channelId: string) {
  lockChannel(channelId, ChannelLockType.COOLDOWN)

  const cooldown = channelCooldown[channelId]

  if (cooldown) {
    clearTimeout(cooldown)
  }

  const timeoutId = setTimeout(() => {
    unlockChannel(channelId, ChannelLockType.COOLDOWN)
  }, Environment.MESSAGE_COOLDOWN_SEC * 1000)

  channelCooldown[channelId] = timeoutId
}

/**
 * set cooldown of the channel
 *
 * @param {string} channelId - the id of channel that want to reset cooldown
 *
 */
export async function resetCooldown(
  message: Message,
  stickyMessage: StickyMessage,
): Promise<void> {
  lockChannel(message.channelId, ChannelLockType.COOLDOWN)

  const cooldown = channelCooldown[message.channelId]

  if (cooldown) {
    clearTimeout(cooldown)
  }

  const timeoutId = setTimeout(() => {
    unlockChannel(message.channelId, ChannelLockType.COOLDOWN)
    pushMessageToBottom(message, stickyMessage)
  }, Environment.MESSAGE_COOLDOWN_SEC * 1000)

  channelCooldown[message.channelId] = timeoutId
}

/**
 * Check if it is necessary to update the sticky message at the bottom of the channel.
 *
 * @param {string} channelId - The ID of the channel to check.
 * @returns `true` if the conditions for updating the message are met, otherwise `false`.
 *
 */
export function isNeedToUpdateMessage(channelId: string): boolean {
  //! message >= 5 (even it is cooldown) -> true
  //! channel lock (available) and message >= 5 -> false
  // channel unlock and message < 5 -> true
  // channel lock (cooldown) and message < 5 -> false
  return (
    !isChannelLock(channelId, ChannelLockType.COOLDOWN) ||
    getCounter(channelId) >= Environment.MESSAGE_MAX
  )
}
