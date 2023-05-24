import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import * as cache from '../../utils/cache.js'

import * as stickyMessage from './index.js'
import { resetCooldown, startCooldown } from './messageCooldown.js'

vi.mock('../../config.js', async () => {
  const Environment = {
    MESSAGE_COOLDOWN_SEC: 15,
    MESSAGE_MAX: 5,
  }

  return { Environment }
})

vi.mock('./index', async () => {
  const pushMessageToBottom = vi.fn()
  const STICKY_COOLDOWN_PREFIX = 'MOCK_COOLDOWN_PREFIX'

  return { pushMessageToBottom, STICKY_COOLDOWN_PREFIX }
})

describe('startCooldown', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should start the cooldown for the specified channel', async () => {
    const channelId = '123456789'

    vi.spyOn(cache, 'saveCache')

    startCooldown(channelId)

    expect(cache.saveCache).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${channelId}`,
      true,
    )
  })

  it('should unlock channel when timeout', async () => {
    const channelId = '123456789'

    vi.spyOn(cache, 'saveCache')

    // Mock the setTimeout function to immediately trigger the callback
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback()
      return {} as unknown as NodeJS.Timeout
    })

    await startCooldown(channelId)

    expect(cache.saveCache).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${channelId}`,
      true,
    )
    expect(cache.saveCache).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${channelId}`,
      false,
    )
  })
})

describe('resetCooldown', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should lock channel when not timeout', async () => {
    const message = {
      channelId: '123456789',
    } as unknown as Message
    const stickyMessageEntity = {} as unknown as StickyMessage

    vi.spyOn(cache, 'saveCache')

    await resetCooldown(message, stickyMessageEntity)

    expect(cache.saveCache).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${message.channelId}`,
      true,
    )
  })

  it('should reset the cooldown and push the message to the bottom when timeout', async () => {
    const message = {
      channelId: '123456789',
    } as unknown as Message
    const stickyMessageEntity = {} as unknown as StickyMessage

    vi.spyOn(cache, 'saveCache')
    vi.spyOn(stickyMessage, 'pushMessageToBottom')

    // Mock the setTimeout function to immediately trigger the callback
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback()
      return {} as unknown as NodeJS.Timeout
    })

    await resetCooldown(message, stickyMessageEntity)

    expect(cache.saveCache).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${message.channelId}`,
      true,
    )
    expect(cache.saveCache).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${message.channelId}`,
      false,
    )
    expect(stickyMessage.pushMessageToBottom).toHaveBeenCalledWith(
      message,
      stickyMessageEntity,
    )
  })
})
