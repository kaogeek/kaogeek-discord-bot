import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Bot from '../../src/client'

vi.mock('../../src/config.js')

describe('Bot', () => {
  let client: Bot

  beforeEach(async () => {
    const { Environment } = await import('../../src/config.js')
    Environment.FLAG_ROLE_ID = 'MOCK_FLAG_ROLE_ID'

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
