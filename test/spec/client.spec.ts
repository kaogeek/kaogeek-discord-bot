import { Bot } from '@/Bot.ts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/src/config.ts')

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
