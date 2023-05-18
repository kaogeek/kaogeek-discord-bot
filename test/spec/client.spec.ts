import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Bot from '../../src/client'

vi.mock('../../src/config.js', () => {
  const Environment = { BOT_TOKEN: 'MOCK_TOKEN' }

  return { Environment }
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
    client.init = vi.fn()
    expect(client).toBeDefined()
  })
})
