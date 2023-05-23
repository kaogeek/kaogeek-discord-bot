import { Bot } from '@/Bot'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/src/config')

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
