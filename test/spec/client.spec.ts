import { afterEach, describe, expect, it, vi } from 'vitest'

import Bot from '../../src/client'

vi.mock('../../src/config.js', () => {
  const Environment = { BOT_TOKEN: 'MOCK_TOKEN' }

  return { Environment }
})

describe('Bot', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should defined', async () => {
    expect(new Bot()).toBeDefined()
  })
})
