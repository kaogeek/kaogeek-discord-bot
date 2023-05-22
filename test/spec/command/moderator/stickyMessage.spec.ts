import {
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  Message,
  TextChannel,
} from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import stickyMessage from '../../../../src/commands/moderators/stickyMessage.js'
import { STICKY_CACHE_PREFIX } from '../../../../src/features/stickyMessage/index.js'
import { prisma } from '../../../../src/prisma.js'
import { BotContext } from '../../../../src/types/BotContext.js'
import * as cache from '../../../../src/utils/cache.js'

vi.mock('../../../../src/config.js', async () => {
  const Environment = {}

  return { Environment }
})

describe('stickao-create', () => {
  const channelId = 'test-channel'
  const message = 'MOCK_MESSAGE'
  let client: Client
  let interaction: ChatInputCommandInteraction<CacheType>
  let channel: TextChannel
  let sentMessage: Message<true>
  let stickyMessageEntity: StickyMessage

  beforeEach(() => {
    interaction = {
      channelId,
      options: { getString: vi.fn() },
      editReply: vi.fn(),
      isChatInputCommand: vi.fn(),
      guild: {},
    } as unknown as ChatInputCommandInteraction<CacheType>

    client = {
      channels: {
        cache: {
          get: vi.fn(),
        },
      },
    } as unknown as Client

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

  it('should reply error if message option is empty', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(interaction.options, 'getString').mockReturnValue('')

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(interaction.options.getString).toHaveBeenCalledWith('message')
    expect(interaction.editReply).toHaveBeenCalled()
    expect(channel.send).not.toHaveBeenCalled()
  })

  it('should reply error if channel type is not text channel', async () => {
    channel = {
      send: vi.fn(),
      type: ChannelType.GuildVoice,
    } as unknown as TextChannel

    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(interaction.options, 'getString').mockReturnValue(message)
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    prisma.stickyMessage.upsert = vi.fn()

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(interaction.editReply).toHaveBeenCalled()
    expect(channel.send).not.toHaveBeenCalled()
    expect(prisma.stickyMessage.upsert).not.toHaveBeenCalled()
  })

  it('should send message if input is valid', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(interaction.options, 'getString').mockReturnValue(message)
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(channel.send).toHaveBeenCalledWith({ content: message })
  })

  it('should save message to database and cache after sent message', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(interaction.options, 'getString').mockReturnValue(message)
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalledWith({
      create: {
        messageId: sentMessage.id,
        channelId: interaction.channelId,
        message: message,
      },
      update: {
        messageId: sentMessage.id,
        message: message,
      },
      where: {
        channelId: interaction.channelId,
      },
    })
    expect(cache.saveCache).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${channelId}`,
      stickyMessageEntity,
    )
  })

  it('should reply user that successfully create sticky message', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(interaction.options, 'getString').mockReturnValue(message)
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(interaction.editReply).toHaveBeenCalled()
  })

  it('should reply user that has error when error occur', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(interaction.options, 'getString').mockReturnValue(message)
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'saveCache')
    vi.spyOn(interaction, 'editReply')

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(interaction.editReply).toHaveBeenCalled()
  })
})

describe('stickao-remove', () => {
  const channelId = 'test-channel'
  const message = 'MOCK_MESSAGE'
  let interaction: ChatInputCommandInteraction<CacheType>
  let stickyMessageEntity: StickyMessage
  let client: Client

  beforeEach(() => {
    interaction = {
      channelId,
      editReply: vi.fn(),
      isChatInputCommand: vi.fn(),
      guild: {},
    } as unknown as ChatInputCommandInteraction<CacheType>

    client = {
      channels: {
        cache: {
          get: vi.fn(),
        },
      },
    } as unknown as Client

    stickyMessageEntity = { message: message } as unknown as StickyMessage
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should use STICKY_CACHE_PREFIX with channelId as cache key', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage[1].execute({ client } as BotContext, interaction)

    expect(cache.getCache).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${channelId}`,
    )
    expect(cache.removeCache).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${channelId}`,
    )
  })

  it('should find then delete message and remove cache successfully', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage[1].execute({ client } as BotContext, interaction)

    expect(prisma.stickyMessage.delete).toHaveBeenCalledWith({
      where: {
        channelId: interaction.channelId,
      },
    })
    expect(cache.removeCache).toHaveBeenCalled()
  })

  it('should reply to the user that the sticky message was deleted successfully', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')
    vi.spyOn(interaction, 'editReply')

    await stickyMessage[1].execute({ client } as BotContext, interaction)

    expect(interaction.editReply).toHaveBeenCalled()
  })

  it('should reply to the user that no sticky message was found in the channel', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')
    vi.spyOn(interaction, 'editReply')

    await stickyMessage[1].execute({ client } as BotContext, interaction)

    expect(interaction.editReply).toHaveBeenCalled()
    expect(prisma.stickyMessage.delete).not.toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
  })

  it('should reply to the user that an error occurred while deleting the sticky message', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'removeCache')
    vi.spyOn(interaction, 'editReply')

    await stickyMessage[1].execute({ client } as BotContext, interaction)

    expect(interaction.editReply).toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
  })
})
