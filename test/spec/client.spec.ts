import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Bot } from '../../src/Bot.js'

vi.mock('../../src/config.js')

vi.mock('../../src/Bot.js', () => {
  const Bot = vi.fn()
  Bot.prototype.InitAndStart = vi.fn()

  return { Bot }
})

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
