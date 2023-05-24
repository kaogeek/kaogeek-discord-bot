import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Bot } from './Bot'

vi.mock('@/config')

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
