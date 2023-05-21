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
 * @param channelId - the id of channel that message want sent
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
 * @param channelId - the id of channel of counter that want to reset
 *
 */
export function resetCounter(channelId: string): void {
  messageInChannelCounter[channelId] = 1
}

/**
 * Get current message count
 *
 * @param channelId - the id of channel that message want sent
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
 * @param channelId - the id of channel that want to reset cooldown
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
 * check is need to update the sticky message to bottom of channel
 *
 * @param channelId - the id of channel that want to check
 * @returns true if need to update otherwise false.
 *
 */
export function isNeedToUpdateMessage(channelId: string): boolean {
  //! channel lock cooldown and message >= 5 push -> cooldown
  // channel unlock and message < 5 push
  // channel lock cooldown and message < 5 do nothing
  //! channel lock available and message >= 5 do nothing -> doing task
  return (
    !isChannelLock(channelId, ChannelLockType.COOLDOWN) ||
    getCounter(channelId) >= Environment.MESSAGE_MAX
  )
}
