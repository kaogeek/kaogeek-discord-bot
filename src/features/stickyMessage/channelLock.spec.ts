import { afterEach, describe, expect, it, vi } from 'vitest'

import { isChannelLock, lockChannel, unlockChannel } from './channelLock'
import { STICKY_LOCK_PREFIX } from './stickyMessages'

vi.mock('@/config')

vi.mock('@/utils/cache', async () => {
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
    const { saveCache } = await import('@/utils/cache')

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
    const { saveCache } = await import('@/utils/cache')

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
    const { getCache } = await import('@/utils/cache')

    isChannelLock(channelId)

    expect(getCache).toHaveBeenCalledWith(`${STICKY_LOCK_PREFIX}-${channelId}`)
  })
})
