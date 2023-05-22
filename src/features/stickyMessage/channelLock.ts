import { getCache, saveCache } from '../../utils/cache.js'

import { STICKY_LOCK_PREFIX } from './index.js'

/**
 * Set the channel status to locked
 *
 * @param {string} channelId - the id of channel that want to lock
 *
 */
export function lockChannel(channelId: string): void {
  saveCache(`${STICKY_LOCK_PREFIX}-${channelId}`, true)
}

/**
 * Set the channel status to unlocked
 *
 * @param {string} channelId - the id of channel that want to unlock
 *
 */
export function unlockChannel(channelId: string): void {
  saveCache(`${STICKY_LOCK_PREFIX}-${channelId}`, false)
}

/**
 * Check the channel status is lock
 *
 * @param {string} channelId - the id of channel that want to check
 * @returns cooldown status (default) if available flag is true return channel available status
 *
 */
export function isChannelLock(channelId: string): boolean {
  return getCache(`${STICKY_LOCK_PREFIX}-${channelId}`) === true
}
