import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import * as stickyMessage from '../../../../src/features/stickyMessage'
import {
  resetCooldown,
  startCooldown,
} from '../../../../src/features/stickyMessage/messageCooldown'
import * as cache from '../../../../src/utils/cache.js'

vi.mock('../../../../src/config.js', async () => {
  const Environment = {
    MESSAGE_COOLDOWN_SEC: 15,
    MESSAGE_MAX: 5,
  }

  return { Environment }
})

vi.mock('../../../../src/features/stickyMessage/index', async () => {
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

    const saveCacheSpy = vi.spyOn(cache, 'saveCache')

    startCooldown(channelId)

    expect(saveCacheSpy).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${channelId}`,
      true,
    )
  })

  it('should unlock channel when timeout', async () => {
    const channelId = '123456789'

    const saveCacheSpy = vi.spyOn(cache, 'saveCache')

    // Mock the setTimeout function to immediately trigger the callback
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback()
      return {} as unknown as NodeJS.Timeout
    })

    await startCooldown(channelId)

    expect(saveCacheSpy).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${channelId}`,
      true,
    )
    expect(saveCacheSpy).toHaveBeenCalledWith(
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

    const saveCacheSpy = vi.spyOn(cache, 'saveCache')

    await resetCooldown(message, stickyMessageEntity)

    expect(saveCacheSpy).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${message.channelId}`,
      true,
    )
  })

  it('should reset the cooldown and push the message to the bottom when timeout', async () => {
    const message = {
      channelId: '123456789',
    } as unknown as Message
    const stickyMessageEntity = {} as unknown as StickyMessage

    const saveCacheSpy = vi.spyOn(cache, 'saveCache')
    const pushMessageToBottomSpy = vi.spyOn(
      stickyMessage,
      'pushMessageToBottom',
    )

    // Mock the setTimeout function to immediately trigger the callback
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback()
      return {} as unknown as NodeJS.Timeout
    })

    await resetCooldown(message, stickyMessageEntity)

    expect(saveCacheSpy).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${message.channelId}`,
      true,
    )
    expect(saveCacheSpy).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_COOLDOWN_PREFIX}-${message.channelId}`,
      false,
    )
    expect(pushMessageToBottomSpy).toHaveBeenCalledWith(
      message,
      stickyMessageEntity,
    )
  })
})
