import { ChannelType, Client, Message, TextChannel } from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import stickyMessage from '../../../src/events/stickyMessageCreate.js'
import { STICKY_CACHE_PREFIX } from '../../../src/features/stickyMessage/index.js'
import { prisma } from '../../../src/prisma.js'
import { BotContext } from '../../../src/types/BotContext.js'
import * as cache from '../../../src/utils/cache.js'

vi.mock('../../../src/config.js', async () => {
  const Environment = {}

  return { Environment }
})

describe('stickao-create', () => {
  const channelId = 'test-channel'
  const messageContent = 'MOCK_MESSAGE'
  let client: Client
  let message: Message
  let channel: TextChannel
  let sentMessage: Message<true>
  let stickyMessageEntity: StickyMessage

  beforeEach(() => {
    client = {
      channels: {
        cache: {
          get: vi.fn(),
        },
      },
      user: {
        send: vi.fn(),
      },
    } as unknown as Client

    message = {
      channelId,
      content: messageContent,
      delete: vi.fn(),
    } as unknown as Message

    channel = {
      send: vi.fn(),
      type: ChannelType.GuildText,
    } as unknown as TextChannel

    sentMessage = {} as unknown as Message<true>

    stickyMessageEntity = {} as unknown as StickyMessage
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should reply error if channel type is not text channel', async () => {
    channel = {
      send: vi.fn(),
      type: ChannelType.GuildVoice,
    } as unknown as TextChannel

    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    prisma.stickyMessage.upsert = vi.fn()

    await stickyMessage.execute({ client } as BotContext, message)

    expect(client.user?.send).toHaveBeenCalled()
    expect(channel.send).not.toHaveBeenCalled()
    expect(prisma.stickyMessage.upsert).not.toHaveBeenCalled()
  })

  it('should send message if input is valid', async () => {
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn()

    await stickyMessage.execute({ client } as BotContext, message)

    expect(channel.send).toHaveBeenCalledWith({ content: message })
  })

  it('should save message to database and cache after sent message', async () => {
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalledWith({
      create: {
        messageId: sentMessage.id,
        channelId: channelId,
        message: message,
      },
      update: {
        messageId: sentMessage.id,
        message: message,
      },
      where: {
        channelId: channelId,
      },
    })
    expect(cache.saveCache).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${channelId}`,
      stickyMessageEntity,
    )
  })

  it('should reply user that successfully create sticky message', async () => {
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).toHaveBeenCalled()
    expect(client.user?.send).toHaveBeenCalled()
  })

  it('should reply user that has error when error occur', async () => {
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'saveCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(client.user?.send).toHaveBeenCalled()
  })

  it('should delete command after finish task', async () => {
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).toHaveBeenCalled()
    expect(message.delete()).toHaveBeenCalled()
  })

  it('should delete command if got error while save message to database', async () => {
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'saveCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(message.delete()).toHaveBeenCalled()
  })

  it('should delete command if got error while send message to channel', async () => {
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockRejectedValue(new Error('error occur'))

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).not.toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(message.delete()).toHaveBeenCalled()
  })
})
