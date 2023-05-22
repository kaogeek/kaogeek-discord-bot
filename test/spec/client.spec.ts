import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Bot } from '../../src/Bot.js'

vi.mock('../../src/config.js')

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

  it('should be defined', async () => {
    expect(client).toBeDefined()
  })
})
