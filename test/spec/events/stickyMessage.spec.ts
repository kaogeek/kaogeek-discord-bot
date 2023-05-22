import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
  const channelId = 'test-channel'
  let message: Message
  let stickyMessageEntity: StickyMessage

  beforeEach(() => {
    message = { channelId } as unknown as Message
    stickyMessageEntity = {} as unknown as StickyMessage
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should use STICKY_CACHE_PREFIX with channelId as cache key', async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    vi.spyOn(stickyMessage, 'isNeedToUpdateMessage').mockReturnValue(true)
    vi.spyOn(channelLock, 'isChannelLock').mockReturnValue(false)
    vi.spyOn(stickyMessage, 'pushMessageToBottom')

    await stickyMessageEventHandler.execute(
      {} as unknown as BotContext,
      message,
    )

    expect(cache.getCache).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_CACHE_PREFIX}-${channelId}`,
    )
  })

  it('should push sticky message to bottom when it needs to be updated', async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    vi.spyOn(stickyMessage, 'isNeedToUpdateMessage').mockReturnValue(true)
    vi.spyOn(channelLock, 'isChannelLock').mockReturnValue(false)
    vi.spyOn(stickyMessage, 'pushMessageToBottom')

    await stickyMessageEventHandler.execute(
      {} as unknown as BotContext,
      message,
    )

    expect(stickyMessage.pushMessageToBottom).toHaveBeenCalledWith(
      message,
      stickyMessageEntity,
    )
  })

  it('should do nothing if channel is locked', async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    vi.spyOn(stickyMessage, 'isNeedToUpdateMessage').mockReturnValue(true)
    vi.spyOn(channelLock, 'isChannelLock').mockReturnValue(true)
    vi.spyOn(stickyMessage, 'pushMessageToBottom')

    await stickyMessageEventHandler.execute(
      {} as unknown as BotContext,
      message,
    )

    expect(channelLock.isChannelLock).toHaveBeenCalledWith(channelId)
    expect(stickyMessage.pushMessageToBottom).not.toHaveBeenCalled()
  })

  it("should increase counter when doesn't need to update", async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    vi.spyOn(stickyMessage, 'isNeedToUpdateMessage').mockReturnValue(false)
    vi.spyOn(messageCounter, 'incCounter')

    await stickyMessageEventHandler.execute(
      {} as unknown as BotContext,
      message,
    )

    expect(messageCounter.incCounter).toHaveBeenCalledWith(channelId)
    expect(channelLock.isChannelLock).not.toHaveBeenCalled()
    expect(stickyMessage.pushMessageToBottom).not.toHaveBeenCalled()
  })

  it('should do nothing if not found sticky message in channel', async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    vi.spyOn(stickyMessage, 'isNeedToUpdateMessage')
    vi.spyOn(messageCounter, 'incCounter')

    await stickyMessageEventHandler.execute(
      {} as unknown as BotContext,
      message,
    )

    expect(messageCounter.incCounter).not.toHaveBeenCalled()
    expect(channelLock.isChannelLock).not.toHaveBeenCalled()
    expect(stickyMessage.pushMessageToBottom).not.toHaveBeenCalled()
  })
})
