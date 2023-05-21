import { Environment } from '../../config.js'

import {
  ChannelLockType,
  isChannelLock,
  lockChannel,
  unlockChannel,
} from './lockChannel.js'

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

/**
 * set cooldown of the channel
 *
 * @param channelId - the id of channel that want to reset cooldown
 *
 */
export function resetCooldown(channelId: string): void {
  lockChannel(channelId, ChannelLockType.COOLDOWN)

  const timeoutId = setTimeout(() => {
    unlockChannel(channelId, ChannelLockType.COOLDOWN)
  }, Environment.MESSAGE_COOLDOWN_SEC * 1000)

  channelCooldown[channelId] = timeoutId
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
