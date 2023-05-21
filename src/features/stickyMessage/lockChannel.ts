interface ChannelLock {
  [channelId: string]: boolean
}

const channelLock: ChannelLock = {}
const channelLockCooldown: ChannelLock = {}

/**
 * Set the channel status to locked
 *
 * @param channelId - the id of channel that want to lock
 * @param unlockAvailable - flag to lock available status of channel (default = false)
 *
 */
export function lockChannel(channelId: string, lockAvailable = false): void {
  if (lockAvailable) {
    channelLock[channelId] = true
  }

  channelLockCooldown[channelId] = true
}

/**
 * Set the channel status to unlocked
 *
 * @param channelId - the id of channel that want to unlock
 * @param unlockAvailable - flag to unlock available status of channel (default = false)
 *
 */
export function unlockChannel(
  channelId: string,
  unlockAvailable = false,
): void {
  if (unlockAvailable) {
    channelLock[channelId] = false
  }

  channelLockCooldown[channelId] = false
}

/**
 * Check the channel status is lock
 *
 * @param channelId - the id of channel that want to check
 * @param available - flag to return available status of channel (default = false)
 * @returns cooldown status (default) if available flag is true return channel available status
 *
 */
export function isChannelLock(channelId: string, available = false): boolean {
  if (available) {
    return channelLock[channelId] === true
  }

  return channelLockCooldown[channelId] === true
}
