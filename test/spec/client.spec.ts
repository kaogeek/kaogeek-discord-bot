import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Bot } from '../../src/Bot.js'

vi.mock('../../src/config.js')

describe('Bot', () => {
  let client: Bot

  beforeEach(() => {
    client = new Bot()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should be defined', async () => {
    expect(client).toBeDefined()
  })
})
