import { Collection, Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  STICKY_CACHE_PREFIX,
  isNeedToUpdateMessage,
  pushMessageToBottom,
} from '../../../../src/features/stickyMessage'
import * as channelLock from '../../../../src/features/stickyMessage/channelLock'
import * as messageCooldown from '../../../../src/features/stickyMessage/messageCooldown'
import * as messageCounter from '../../../../src/features/stickyMessage/messageCounter'
import { prisma } from '../../../../src/prisma.js'
import * as cache from '../../../../src/utils/cache.js'

vi.mock('../../../../src/config.js', async () => {
  const Environment = {
    MESSAGE_COOLDOWN_SEC: 15,
    MESSAGE_MAX: 5,
  }

  return { Environment }
})

describe('isNeedToUpdateMessage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return true if message count is equal to 5 even isChannelLock (cooldown) is true', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(5)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(true)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    expect(getCounterSpy).toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should return true if message count is equal to 5 and isChannelLock (cooldown) is false', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(5)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(false)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    // get counter should not have been called
    expect(getCounterSpy).not.toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should return true if message count is greater than 5 even isChannelLock (cooldown) is true', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(8)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(true)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    expect(getCounterSpy).toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should return true if message count is greater than 5 and isChannelLock (cooldown) is false', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(8)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(false)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    // get counter should not have been called
    expect(getCounterSpy).not.toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should return true if isChannelLock (cooldown) is false and message count is less than 5', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(3)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(false)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeTruthy()
    // get counter should not have been called
    expect(getCounterSpy).not.toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should return false if isChannelLock (cooldown) is true and message count is less than 5', () => {
    const channelId = 'test-channel'

    const getCounterSpy = vi
      .spyOn(messageCounter, 'getCounter')
      .mockReturnValue(2)
    const isChannelLockSpy = vi
      .spyOn(messageCooldown, 'isCooldown')
      .mockReturnValue(true)

    const result = isNeedToUpdateMessage(channelId)

    expect(result).toBeFalsy()
    expect(getCounterSpy).toHaveBeenCalledWith(channelId)
    expect(isChannelLockSpy).toHaveBeenCalledWith(channelId)
  })
})

describe('pushMessageToBottom', () => {
  let channelId: string
  let inputMessage: Message
  let oldMessage: Message<true>
  let newMessage: Message<true>
  let inputStickyMessageEntity: StickyMessage
  let updatedStickyMessageEntity: StickyMessage

  beforeEach(() => {
    channelId = 'test-channel'

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

  it('should lock channel before doing task', async () => {
    const channelId = 'test-channel'

    const lockSpy = vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(messageCooldown, 'resetCooldown')
    vi.spyOn(messageCounter, 'resetCounter')
    vi.spyOn(channelLock, 'unlockChannel')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(lockSpy).toHaveBeenCalledWith(channelId)
  })

  it('should fetch message by using message from sticky message entity', async () => {
    vi.spyOn(channelLock, 'lockChannel')
    const fecthSpy = vi.spyOn(inputMessage.channel.messages, 'fetch')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(fecthSpy).toHaveBeenCalledWith(inputStickyMessageEntity.messageId)
  })

  it('should send message by using message from sticky message entity', async () => {
    vi.spyOn(channelLock, 'lockChannel')
    vi.spyOn(inputMessage.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    const sendSpy = vi.spyOn(inputMessage.channel, 'send')
    vi.spyOn(messageCooldown, 'resetCooldown')
    vi.spyOn(messageCounter, 'resetCounter')
    vi.spyOn(channelLock, 'unlockChannel')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(sendSpy).toHaveBeenCalledWith({
      content: inputStickyMessageEntity.message,
    })
  })

  //! fix later
  it('should update message in database and cache it when successfully sent new message', async () => {
    const lockChannelSpy = vi.spyOn(channelLock, 'lockChannel')
    const fecthSpy = vi
      .spyOn(inputMessage.channel.messages, 'fetch')
      .mockResolvedValue(
        new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
      )
    const sendSpy = vi
      .spyOn(inputMessage.channel, 'send')
      .mockResolvedValue(newMessage)
    prisma.stickyMessage.update = vi
      .fn()
      .mockResolvedValue(updatedStickyMessageEntity)
    const saveCacheSpy = vi.spyOn(cache, 'saveCache')
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

    expect(fecthSpy).toHaveBeenCalledWith(inputStickyMessageEntity.messageId)
    expect(sendSpy).toHaveBeenCalledWith({
      content: inputStickyMessageEntity.message,
    })
    expect(lockChannelSpy).toHaveBeenCalledWith(channelId)
    expect(saveCacheSpy).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${channelId}`,
      updatedStickyMessageEntity,
    )
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
    const unlockChannelSpy = vi.spyOn(channelLock, 'unlockChannel')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(unlockChannelSpy).toHaveBeenCalledWith(channelId)
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
    const unlockChannelSpy = vi.spyOn(channelLock, 'unlockChannel')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(unlockChannelSpy).toHaveBeenCalledWith(channelId)
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
    const resetCooldownSpy = vi.spyOn(messageCooldown, 'resetCooldown')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(resetCooldownSpy).toHaveBeenCalledWith(
      newMessage,
      updatedStickyMessageEntity,
    )
  })

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
    const resetCooldownSpy = vi.spyOn(messageCooldown, 'resetCooldown')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(resetCooldownSpy).toHaveBeenCalledWith(
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
    const resetCounterSpy = vi.spyOn(messageCounter, 'resetCounter')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(resetCounterSpy).toHaveBeenCalledWith(channelId)
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
    const resetCounterSpy = vi.spyOn(messageCounter, 'resetCounter')

    await pushMessageToBottom(inputMessage, inputStickyMessageEntity)

    expect(resetCounterSpy).toHaveBeenCalledWith(channelId)
  })
})
