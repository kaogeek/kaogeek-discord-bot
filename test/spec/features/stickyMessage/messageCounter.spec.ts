import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getCounter,
  incCounter,
  resetCounter,
} from '../../../../src/features/stickyMessage/messageCounter'

vi.mock('../../../../src/config.js', async () => {
  const Environment = {
    MESSAGE_COOLDOWN_SEC: 15,
    MESSAGE_MAX: 5,
  }

  return { Environment }
})

vi.mock('../../../../src/stickyMessage/messageCooldown', async () => {
  const getCounter = vi.fn()
  const incCounter = vi.fn()

  return { getCounter, incCounter }
})

describe('incCounter', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    { n: 2, expected: 2 },
    { n: 5, expected: 7 },
    { n: 0, expected: 7 },
  ])(
    'should increase the message counter for the specified channel',
    ({ n, expected }) => {
      const channelId = 'test-channel'

      for (let i = 0; i < n; i++) {
        incCounter(channelId)
      }

      // Assert that the message counter is incremented correctly
      expect(getCounter(channelId)).toBe(expected)
    },
  )
})

describe('resetCounter', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should reset the message counter for the specified channel', () => {
    const channelId = 'test-channel'

    resetCounter(channelId)

    // Assert that the message counter is reset to 1
    expect(getCounter(channelId)).toBe(1)
  })
})
