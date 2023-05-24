import { afterEach, describe, expect, it, vi } from 'vitest'

import { isChannelLock, lockChannel, unlockChannel } from './channelLock.js'
import { STICKY_LOCK_PREFIX } from './index.js'

vi.mock('../../config.js', async () => {
  const Environment = {
    MESSAGE_COOLDOWN_SEC: 15,
    MESSAGE_MAX: 5,
  }

  return { Environment }
})

vi.mock('../../utils/cache.js', async () => {
  const getCache = vi.fn()
  const saveCache = vi.fn()

  return { getCache, saveCache }
})

describe('lockChannel', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call save cache to update channel status to locked with prefix, STICKY_CACHE_PREFIX', async () => {
    const channelId = 'test-channel'
    const { saveCache } = await import('../../utils/cache.js')

    lockChannel(channelId)

    expect(saveCache).toHaveBeenCalledWith(
      `${STICKY_LOCK_PREFIX}-${channelId}`,
      true,
    )
  })
})

describe('unlockChannel', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call save cache to update channel status to unlocked with prefix, STICKY_CACHE_PREFIX', async () => {
    const channelId = 'test-channel'
    const { saveCache } = await import('../../utils/cache.js')

    unlockChannel(channelId)

    expect(saveCache).toHaveBeenCalledWith(
      `${STICKY_LOCK_PREFIX}-${channelId}`,
      false,
    )
  })
})

describe('isChannelLock', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call get cache to get channel status with prefix, STICKY_CACHE_PREFIX', async () => {
    const channelId = 'test-channel'
    const { getCache } = await import('../../utils/cache.js')

    isChannelLock(channelId)

    expect(getCache).toHaveBeenCalledWith(`${STICKY_LOCK_PREFIX}-${channelId}`)
  })
})
