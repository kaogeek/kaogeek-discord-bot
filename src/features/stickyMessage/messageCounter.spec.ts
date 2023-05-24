import { afterEach, describe, expect, it, vi } from 'vitest'

import { getCounter, incCounter, resetCounter } from './messageCounter'

vi.mock('@/config')

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

      for (let index = 0; index < n; index++) {
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
