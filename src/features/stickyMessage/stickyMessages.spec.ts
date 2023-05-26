import { Collection, Message, MessageFlags } from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { prisma } from '@/prisma'
import * as cache from '@/utils/cache'

import * as channelLock from './channelLock'
import * as messageCooldown from './messageCooldown'
import * as messageCounter from './messageCounter'
import {
  STICKY_CACHE_PREFIX,
  initStickyMessage,
  isNeedToUpdateMessage,
  pushMessageToBottom,
} from './stickyMessages'

vi.mock('@/config')

describe('initStickyMessage', () => {
  const channelId = 'test-channel'
  let messages: StickyMessage[]

  beforeEach(() => {
    messages = [{ channelId } as unknown as StickyMessage]
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should query all messages from database', async () => {
    vi.spyOn(messageCounter, 'resetCounter')
    prisma.stickyMessage.findMany = vi.fn().mockResolvedValue(messages)

    await initStickyMessage()

    expect(prisma.stickyMessage.findMany).toHaveBeenCalled()
  })

  it("should reset counter of stickyMessage's channel", async () => {
    vi.spyOn(messageCounter, 'resetCounter')
    prisma.stickyMessage.findMany = vi.fn().mockResolvedValue(messages)

    await initStickyMessage()

    expect(messageCounter.resetCounter).toHaveBeenCalledWith(channelId)
  })
})

describe('isNeedToUpdateMessage', () => {
  const channelId = 'test-channel'

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return true if message count is equal to 5 even isChannelLock (cooldown) is true', () => {
    vi.spyOn(messageCounter, 'getCounter').mockReturnValue(5)
    vi.spyOn(messageCooldown, 'isCooldown').mockReturnValue(true)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    expect(messageCounter.getCounter).toHaveBeenCalledWith(channelId)
    expect(messageCooldown.isCooldown).toHaveBeenCalledWith(channelId)
  })

  it('should return true if message count is equal to 5 and isChannelLock (cooldown) is false', () => {
    vi.spyOn(messageCounter, 'getCounter').mockReturnValue(5)
    vi.spyOn(messageCooldown, 'isCooldown').mockReturnValue(false)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    // get counter should not have been called
    expect(messageCounter.getCounter).not.toHaveBeenCalledWith(channelId)
    expect(messageCooldown.isCooldown).toHaveBeenCalledWith(channelId)
  })

  it('should return true if message count is greater than 5 even isChannelLock (cooldown) is true', () => {
    vi.spyOn(messageCounter, 'getCounter').mockReturnValue(8)
    vi.spyOn(messageCooldown, 'isCooldown').mockReturnValue(true)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    expect(messageCounter.getCounter).toHaveBeenCalledWith(channelId)
    expect(messageCooldown.isCooldown).toHaveBeenCalledWith(channelId)
  })

  it('should return true if message count is greater than 5 and isChannelLock (cooldown) is false', () => {
    vi.spyOn(messageCounter, 'getCounter').mockReturnValue(8)
    vi.spyOn(messageCooldown, 'isCooldown').mockReturnValue(false)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    // get counter should not have been called
    expect(messageCounter.getCounter).not.toHaveBeenCalledWith(channelId)
    expect(messageCooldown.isCooldown).toHaveBeenCalledWith(channelId)
  })

  it('should return true if isChannelLock (cooldown) is false and message count is less than 5', () => {
    vi.spyOn(messageCounter, 'getCounter').mockReturnValue(3)
    vi.spyOn(messageCooldown, 'isCooldown').mockReturnValue(false)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    // get counter should not have been called
    expect(messageCounter.getCounter).not.toHaveBeenCalledWith(channelId)
    expect(messageCooldown.isCooldown).toHaveBeenCalledWith(channelId)
  })

  it('should return false if isChannelLock (cooldown) is true and message count is less than 5', () => {
    vi.spyOn(messageCounter, 'getCounter').mockReturnValue(2)
    vi.spyOn(messageCooldown, 'isCooldown').mockReturnValue(true)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeFalsy()
    expect(messageCounter.getCounter).toHaveBeenCalledWith(channelId)
    expect(messageCooldown.isCooldown).toHaveBeenCalledWith(channelId)
  })
})

describe('pushMessageToBottom', () => {
  const channelId = 'test-channel'
  let inputMessage: Message
  let oldMessage: Message<true>
  let newMessage: Message<true>
  let inputStickyMessageEntity: StickyMessage
  let updatedStickyMessageEntity: StickyMessage

  beforeEach(() => {
    inputMessage = {
      channelId,
      channel: {
        messages: {
          fetch: vi.fn(),
        },
        send: vi.fn(),
      },
    } as unknown as Message

    oldMessage = {
      id: 'old-message',
      delete: vi.fn(),
    } as unknown as Message<true>

    newMessage = {
      id: 'new-message',
    } as unknown as Message<true>

    inputStickyMessageEntity = {
      messageId: 'input-sticky-message-id',
      message: 'MOCK_MESSAGE',
    } as unknown as StickyMessage

    updatedStickyMessageEntity = {} as unknown as StickyMessage
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should use PREFIX_CACHE_KEY and channelId as cache key', async () => {
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(inputMessage.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    vi.spyOn(inputMessage.channel, 'send').mockResolvedValue(newMessage)
    prisma.stickyMessage.update = vi
      .fn()
      .mockResolvedValue(updatedStickyMessageEntity)
    vi.spyOn(cache, 'saveCache')
    vi.spyOn(messageCooldown, 'resetCooldown')
    vi.spyOn(messageCounter, 'resetCounter')
    vi.spyOn(channelLock, 'unlockChannel')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(cache.saveCache).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${channelId}`,
      updatedStickyMessageEntity,
    )
  })

  it('should lock channel before doing task', async () => {
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(messageCooldown, 'resetCooldown')
    vi.spyOn(messageCounter, 'resetCounter')
    vi.spyOn(channelLock, 'unlockChannel')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(channelLock.lockChannel).toHaveBeenCalledWith(channelId)
  })

  it('should fetch message by using message from sticky message entity', async () => {
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(inputMessage.channel.messages, 'fetch')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(inputMessage.channel.messages.fetch).toHaveBeenCalledWith(
      inputStickyMessageEntity.messageId,
    )
  })

  it('should send message by using message from sticky message entity', async () => {
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(inputMessage.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    vi.spyOn(inputMessage.channel, 'send')
    vi.spyOn(messageCooldown, 'resetCooldown')
    vi.spyOn(messageCounter, 'resetCounter')
    vi.spyOn(channelLock, 'unlockChannel')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(inputMessage.channel.send).toHaveBeenCalledWith({
      content: inputStickyMessageEntity.message,
      flags: MessageFlags.SuppressNotifications,
    })
  })

  it('should update message in database and cache it when successfully sent new message', async () => {
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(inputMessage.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    vi.spyOn(inputMessage.channel, 'send').mockResolvedValue(newMessage)
    prisma.stickyMessage.update = vi
      .fn()
      .mockResolvedValue(updatedStickyMessageEntity)
    vi.spyOn(cache, 'saveCache')
    vi.spyOn(messageCooldown, 'resetCooldown')
    vi.spyOn(messageCounter, 'resetCounter')
    vi.spyOn(channelLock, 'unlockChannel')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(prisma.stickyMessage.update).toHaveBeenCalledWith({
      data: {
        messageId: newMessage.id,
      },
      where: {
        channelId: channelId,
      },
    })
    expect(cache.saveCache).toHaveBeenCalled()
  })

  it('should unlock channel when finish task', async () => {
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(inputMessage.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    vi.spyOn(inputMessage.channel, 'send').mockResolvedValue(newMessage)
    prisma.stickyMessage.update = vi
      .fn()
      .mockResolvedValue(updatedStickyMessageEntity)
    vi.spyOn(channelLock, 'unlockChannel')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(channelLock.unlockChannel).toHaveBeenCalledWith(channelId)
  })

  it('should unlock channel when it has error occur', async () => {
    vi.spyOn(inputMessage.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    vi.spyOn(inputMessage.channel, 'send').mockResolvedValue(newMessage)
    prisma.stickyMessage.update = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(cache, 'saveCache')
    vi.spyOn(messageCounter, 'resetCounter')
    vi.spyOn(messageCooldown, 'resetCooldown')
    vi.spyOn(channelLock, 'unlockChannel')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(channelLock.unlockChannel).toHaveBeenCalledWith(channelId)
  })

  it('should reset channel cooldown when finish task', async () => {
    vi.spyOn(inputMessage.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    vi.spyOn(inputMessage.channel, 'send').mockResolvedValue(newMessage)
    prisma.stickyMessage.update = vi
      .fn()
      .mockResolvedValue(updatedStickyMessageEntity)
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(cache, 'saveCache')
    vi.spyOn(channelLock, 'unlockChannel')
    vi.spyOn(messageCounter, 'resetCounter')
    vi.spyOn(messageCooldown, 'resetCooldown')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(messageCooldown.resetCooldown).toHaveBeenCalledWith(
      newMessage,
      updatedStickyMessageEntity,
    )
  })

  //! TODO: fix later
  it.skip('should reset channel cooldown when it has error occur', async () => {
    vi.spyOn(inputMessage.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    vi.spyOn(inputMessage.channel, 'send').mockResolvedValue(newMessage)
    prisma.stickyMessage.update = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(cache, 'saveCache')
    vi.spyOn(channelLock, 'unlockChannel')
    vi.spyOn(messageCounter, 'resetCounter')
    vi.spyOn(messageCooldown, 'resetCooldown')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(messageCooldown.resetCooldown).toHaveBeenCalledWith(
      newMessage,
      updatedStickyMessageEntity,
    )
  })

  it('should reset message counter when finish task', async () => {
    vi.spyOn(inputMessage.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    vi.spyOn(inputMessage.channel, 'send').mockResolvedValue(newMessage)
    prisma.stickyMessage.update = vi
      .fn()
      .mockResolvedValue(updatedStickyMessageEntity)
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(cache, 'saveCache')
    vi.spyOn(channelLock, 'unlockChannel')
    vi.spyOn(messageCooldown, 'resetCooldown')
    vi.spyOn(messageCounter, 'resetCounter')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(messageCounter.resetCounter).toHaveBeenCalledWith(channelId)
  })

  it('should reset message counter when it has error occur', async () => {
    vi.spyOn(inputMessage.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    vi.spyOn(inputMessage.channel, 'send').mockResolvedValue(newMessage)
    prisma.stickyMessage.update = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(cache, 'saveCache')
    vi.spyOn(channelLock, 'unlockChannel')
    vi.spyOn(messageCooldown, 'resetCooldown')
    vi.spyOn(messageCounter, 'resetCounter')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(messageCounter.resetCounter).toHaveBeenCalledWith(channelId)
  })
})
