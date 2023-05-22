import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import stickyMessageEventHandler from '../../../src/events/stickyMessage.js'
import * as channelLock from '../../../src/features/stickyMessage/channelLock.js'
import * as stickyMessage from '../../../src/features/stickyMessage/index.js'
import * as messageCounter from '../../../src/features/stickyMessage/messageCounter.js'
import { BotContext } from '../../../src/types/BotContext.js'
import * as cache from '../../../src/utils/cache.js'

vi.mock('../../../src/config.js', async () => {
  const Environment = {
    MESSAGE_COOLDOWN_SEC: 15,
    MESSAGE_MAX: 5,
  }

  return { Environment }
})

describe('stickyMessageEventHandler', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should push sticky message to bottom when it needs to be updated', async () => {
    const channelId = 'test-channel'
    const message = { channelId } as unknown as Message
    const stickyMessageEntity = {} as unknown as StickyMessage

    const getCacheSpy = vi
      .spyOn(cache, 'getCache')
      .mockReturnValue(stickyMessageEntity)
    const isNeedToUpdateMessageSpy = vi
      .spyOn(stickyMessage, 'isNeedToUpdateMessage')
      .mockReturnValue(true)
    const isChannelLockSpy = vi
      .spyOn(channelLock, 'isChannelLock')
      .mockReturnValue(false)
    const pushMessageToBottomSpy = vi.spyOn(
      stickyMessage,
      'pushMessageToBottom',
    )

    await stickyMessageEventHandler.execute(
      {} as unknown as BotContext,
      message,
    )

    expect(getCacheSpy).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_CACHE_PREFIX}-${channelId}`,
    )
    expect(isNeedToUpdateMessageSpy).toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
    expect(pushMessageToBottomSpy).toHaveBeenCalledWith(
      message,
      stickyMessageEntity,
    )
  })

  it("should increase counter when doesn't need to update", async () => {
    const channelId = 'test-channel'
    const message = { channelId } as unknown as Message
    const stickyMessageEntity = {} as unknown as StickyMessage

    const getCacheSpy = vi
      .spyOn(cache, 'getCache')
      .mockReturnValue(stickyMessageEntity)
    const isNeedToUpdateMessageSpy = vi
      .spyOn(stickyMessage, 'isNeedToUpdateMessage')
      .mockReturnValue(false)
    const incCounterSpy = vi.spyOn(messageCounter, 'incCounter')

    await stickyMessageEventHandler.execute(
      {} as unknown as BotContext,
      message,
    )

    expect(getCacheSpy).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_CACHE_PREFIX}-${channelId}`,
    )
    expect(isNeedToUpdateMessageSpy).toHaveBeenCalledWith(channelId)
    expect(incCounterSpy).toHaveBeenCalledWith(channelId)
  })

  it('should do nothing if not found sticky message in channel', async () => {
    const channelId = 'test-channel'
    const message = { channelId } as unknown as Message

    const getCacheSpy = vi.spyOn(cache, 'getCache').mockReturnValue(null)
    const isNeedToUpdateMessageSpy = vi.spyOn(
      stickyMessage,
      'isNeedToUpdateMessage',
    )
    const incCounterSpy = vi.spyOn(messageCounter, 'incCounter')

    await stickyMessageEventHandler.execute(
      {} as unknown as BotContext,
      message,
    )

    expect(getCacheSpy).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_CACHE_PREFIX}-${channelId}`,
    )
    expect(isNeedToUpdateMessageSpy).not.toHaveBeenCalled()
    expect(incCounterSpy).not.toHaveBeenCalled()
  })

  it('should do nothing if channel is already updated', async () => {
    const channelId = 'test-channel'
    const message = { channelId } as unknown as Message
    const stickyMessageEntity = {} as unknown as StickyMessage

    const getCacheSpy = vi
      .spyOn(cache, 'getCache')
      .mockReturnValue(stickyMessageEntity)
    const isNeedToUpdateMessageSpy = vi
      .spyOn(stickyMessage, 'isNeedToUpdateMessage')
      .mockReturnValue(true)
    const isChannelLockSpy = vi
      .spyOn(channelLock, 'isChannelLock')
      .mockReturnValue(true)
    const pushMessageToBottomSpy = vi.spyOn(
      stickyMessage,
      'pushMessageToBottom',
    )

    await stickyMessageEventHandler.execute(
      {} as unknown as BotContext,
      message,
    )

    expect(getCacheSpy).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_CACHE_PREFIX}-${channelId}`,
    )
    expect(isNeedToUpdateMessageSpy).toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
    expect(pushMessageToBottomSpy).not.toHaveBeenCalled()
  })
})
