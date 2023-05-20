import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Bot from '../../src/client'

vi.mock('../../src/config.js', async () => {
  const Environment = { BOT_TOKEN: 'MOCK_TOKEN' }

  return { Environment }
})

describe('Bot', () => {
  let client: Bot

  beforeEach(async () => {
    client = new Bot()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should defined', async () => {
    client.initAndStart = vi.fn()
    expect(client).toBeDefined()
  })
})
