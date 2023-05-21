import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Bot from '../../src/client'

vi.mock('../../src/config.js', () => {
  const Environment = { BOT_TOKEN: 'MOCK_TOKEN' }

  return { Environment }
})

vi.mock('../../src/features/stickyMessage', () => {
  const initStickyMessage = vi.fn()

  return { initStickyMessage }
})

describe('Bot', () => {
  let client: Bot

  beforeEach(() => {
    client = new Bot()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should defined', async () => {
    expect(client).toBeDefined()
  })
})
