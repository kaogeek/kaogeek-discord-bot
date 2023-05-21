import { describe, expect, it } from 'vitest'

import Bot from '../../src/client'

describe('bot client', () => {
  it('should successfully connect to a discord server', async () => {
    await expect(new Bot().initAndStart()).resolves.not.toThrowError()
  })
})
