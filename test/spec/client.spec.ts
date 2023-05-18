import { describe, expect, it } from 'vitest'

import Bot from '../../src/client'

describe('Bot', () => {
  it('should defined', async () => {
    expect(new Bot()).toBeDefined()
  })
})
