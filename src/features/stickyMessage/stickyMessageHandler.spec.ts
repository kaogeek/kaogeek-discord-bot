import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as channelLock from '@/features/stickyMessage/channelLock'
import * as messageCounter from '@/features/stickyMessage/messageCounter'
import * as stickyMessage from '@/features/stickyMessage/stickyMessages'
import * as cache from '@/utils/cache'

import { stickyMessageHandler } from './stickyMessageHandler'

vi.mock('@/config')

describe('stickyMessageHandler', () => {
  const channelId = 'test-channel'
  let message: Message
  let stickyMessageEntity: StickyMessage

  beforeEach(() => {
    message = { channelId, content: 'MOCK_MESSAGE' } as Message
    stickyMessageEntity = {} as unknown as StickyMessage
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it.each([{ cmd: '?stickao-set' }, { cmd: '?stickao-remove' }])(
    'should do nothing if message content is stickao command',
    async ({ cmd }) => {
      message.content = `${cmd} ${message.content}`
      vi.spyOn(messageCounter, 'incCounter')
      vi.spyOn(channelLock, 'isChannelLock')
      vi.spyOn(stickyMessage, 'pushMessageToBottom')

      await stickyMessageHandler(message)

      expect(messageCounter.incCounter).not.toHaveBeenCalled()
      expect(channelLock.isChannelLock).not.toHaveBeenCalled()
      expect(stickyMessage.pushMessageToBottom).not.toHaveBeenCalled()
    },
  )

  it('should use STICKY_CACHE_PREFIX with channelId as cache key', async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    vi.spyOn(stickyMessage, 'isNeedToUpdateMessage').mockReturnValue(true)
    vi.spyOn(channelLock, 'isChannelLock').mockReturnValue(false)
    vi.spyOn(stickyMessage, 'pushMessageToBottom')

    await stickyMessageHandler(message)

    expect(cache.getCache).toHaveBeenCalledWith(
      `${stickyMessage.STICKY_CACHE_PREFIX}-${channelId}`,
    )
  })

  it('should push sticky message to bottom when it needs to be updated', async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    vi.spyOn(stickyMessage, 'isNeedToUpdateMessage').mockReturnValue(true)
    vi.spyOn(channelLock, 'isChannelLock').mockReturnValue(false)
    vi.spyOn(stickyMessage, 'pushMessageToBottom')

    await stickyMessageHandler(message)

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

    await stickyMessageHandler(message)

    expect(channelLock.isChannelLock).toHaveBeenCalledWith(channelId)
    expect(stickyMessage.pushMessageToBottom).not.toHaveBeenCalled()
  })

  it("should increase counter when doesn't need to update", async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    vi.spyOn(stickyMessage, 'isNeedToUpdateMessage').mockReturnValue(false)
    vi.spyOn(messageCounter, 'incCounter')

    await stickyMessageHandler(message)

    expect(messageCounter.incCounter).toHaveBeenCalledWith(channelId)
    expect(channelLock.isChannelLock).not.toHaveBeenCalled()
    expect(stickyMessage.pushMessageToBottom).not.toHaveBeenCalled()
  })

  it('should do nothing if not found sticky message in channel', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    vi.spyOn(stickyMessage, 'isNeedToUpdateMessage')
    vi.spyOn(messageCounter, 'incCounter')

    await stickyMessageHandler(message)

    expect(messageCounter.incCounter).not.toHaveBeenCalled()
    expect(channelLock.isChannelLock).not.toHaveBeenCalled()
    expect(stickyMessage.pushMessageToBottom).not.toHaveBeenCalled()
  })
})
