import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import * as cache from '@/utils/cache.js'

import { resetCooldown } from './messageCooldown'
import * as messageCounter from './messageCounter'
import * as stickyMessage from './stickyMessages'

vi.mock('@/config')

vi.mock('./index', async () => {
  const pushMessageToBottom = vi.fn()
  const STICKY_COOLDOWN_PREFIX = 'MOCK_COOLDOWN_PREFIX'

  return { pushMessageToBottom, STICKY_COOLDOWN_PREFIX }
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

  it('should reset the cooldown and push the message to the bottom when timeout if message counter more than 0', async () => {
    const message = {
      channelId: '123456789',
    } as unknown as Message
    const stickyMessageEntity = {} as unknown as StickyMessage

    vi.spyOn(cache, 'saveCache')
    vi.spyOn(stickyMessage, 'pushMessageToBottom')
    vi.spyOn(messageCounter, 'getCounter').mockReturnValue(2)

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

  it('should reset the cooldown and do nothing if message counter equal to the initial value (1)', async () => {
    const message = {
      channelId: '123456789',
    } as unknown as Message
    const stickyMessageEntity = {} as unknown as StickyMessage

    vi.spyOn(cache, 'saveCache')
    vi.spyOn(stickyMessage, 'pushMessageToBottom')
    vi.spyOn(messageCounter, 'getCounter').mockReturnValue(1)

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
    expect(stickyMessage.pushMessageToBottom).not.toHaveBeenCalledWith(
      message,
      stickyMessageEntity,
    )
  })
})
