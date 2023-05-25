import { getCache, saveCache } from '../../utils/cache'

import { STICKY_LOCK_PREFIX } from './stickyMessages'

/**
 * Set the channel status to locked
 *
 * @param {string} channelId - the id of channel that want to lock
 * @returns {void} set the channel set status to locked
 *
 */
export function lockChannel(channelId: string): void {
  saveCache(`${STICKY_LOCK_PREFIX}-${channelId}`, true)
}

/**
 * Set the channel status to unlocked
 *
 * @param {string} channelId - the id of channel that want to unlock
 * @returns {void} set the channel set status to unlocked
 *
 */
export function unlockChannel(channelId: string): void {
  saveCache(`${STICKY_LOCK_PREFIX}-${channelId}`, false)
}

/**
 * Check the channel status is lock
 *
 * @param {string} channelId - the id of channel that want to check
 * @returns {boolean} true if the channel is locked, false otherwise
 *
 */
export function isChannelLock(channelId: string): boolean {
  return getCache(`${STICKY_LOCK_PREFIX}-${channelId}`) === true
}
