export enum ChannelLockType {
  AVAILABLE,
  COOLDOWN,
}

interface ChannelLock {
  [channelId: string]: boolean
}

const channelLock: ChannelLock = {}
const channelLockCooldown: ChannelLock = {}

/**
 * Set the channel status to locked
 *
 * @param channelId - the id of channel that want to lock
 * @param type - type of channel lock (default = AVAILABLE)
 *
 */
export function lockChannel(
  channelId: string,
  type = ChannelLockType.AVAILABLE,
): void {
  switch (type) {
    case ChannelLockType.AVAILABLE:
      channelLock[channelId] = true
      channelLockCooldown[channelId] = true
      break
    case ChannelLockType.COOLDOWN:
      channelLockCooldown[channelId] = true
      break
  }
}

/**
 * Set the channel status to unlocked
 *
 * @param channelId - the id of channel that want to unlock
 * @param type - type of channel lock (default = AVAILABLE)
 *
 */
export function unlockChannel(
  channelId: string,
  type = ChannelLockType.AVAILABLE,
): void {
  switch (type) {
    case ChannelLockType.AVAILABLE:
      channelLock[channelId] = false
      channelLockCooldown[channelId] = false
      break
    case ChannelLockType.COOLDOWN:
      channelLockCooldown[channelId] = false
      break
  }
}

/**
 * Check the channel status is lock
 *
 * @param channelId - the id of channel that want to check
 * @param type - type of channel lock (default = AVAILABLE)
 * @returns cooldown status (default) if available flag is true return channel available status
 *
 */
export function isChannelLock(
  channelId: string,
  type = ChannelLockType.AVAILABLE,
): boolean {
  switch (type) {
    case ChannelLockType.AVAILABLE:
      return channelLock[channelId] === true
    case ChannelLockType.COOLDOWN:
      return channelLockCooldown[channelId] === true
  }
}
