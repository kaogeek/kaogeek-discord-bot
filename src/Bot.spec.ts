import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Bot } from './Bot.js'

vi.mock('../config.js')

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
