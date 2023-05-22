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
    const getStringSpy = vi
      .spyOn(interaction.options, 'getString')
      .mockReturnValue('')
    const editReplySpy = vi.spyOn(interaction, 'editReply')
    const sendMessageSpy = vi.spyOn(channel, 'send')

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(getStringSpy).toHaveBeenCalledWith('message')
    expect(editReplySpy).toHaveBeenCalled()
    expect(sendMessageSpy).not.toHaveBeenCalled()
  })

  it('should reply error if channel type is not text channel', async () => {
    channel = {
      send: vi.fn(),
      type: ChannelType.GuildVoice,
    } as unknown as TextChannel

    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    const getStringSpy = vi
      .spyOn(interaction.options, 'getString')
      .mockReturnValue('')
    const editReplySpy = vi.spyOn(interaction, 'editReply')
    const sendMessageSpy = vi.spyOn(channel, 'send')
    prisma.stickyMessage.upsert = vi.fn()

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(getStringSpy).toHaveBeenCalledWith('message')
    expect(editReplySpy).toHaveBeenCalled()
    expect(sendMessageSpy).not.toHaveBeenCalled()
  })

  it('should send message if input is valid', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    const getStringSpy = vi
      .spyOn(interaction.options, 'getString')
      .mockReturnValue(message)

    const getChannelSpy = vi
      .spyOn(client.channels.cache, 'get')
      .mockReturnValue(channel)

    const sendMessageSpy = vi
      .spyOn(channel, 'send')
      .mockResolvedValue(sentMessage)

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(getStringSpy).toHaveBeenCalledWith('message')
    expect(getChannelSpy).toHaveBeenCalledWith(channelId)
    expect(sendMessageSpy).toHaveBeenCalledWith({ content: message })
  })

  it('should save message to database and cache after sent message', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(interaction.options, 'getString').mockReturnValue(message)
    vi.spyOn(client.channels.cache, 'get').mockReturnValue(channel)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    const saveCacheSpy = vi.spyOn(cache, 'saveCache')

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
    expect(saveCacheSpy).toHaveBeenCalledWith(
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
    const editReplySpy = vi.spyOn(interaction, 'editReply')

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(editReplySpy).toHaveBeenCalled()
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
    const editReplySpy = vi.spyOn(interaction, 'editReply')

    await stickyMessage[0].execute({ client } as BotContext, interaction)

    expect(editReplySpy).toHaveBeenCalled()
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
    const getCacheSpy = vi
      .spyOn(cache, 'getCache')
      .mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    const removeCacheSpy = vi.spyOn(cache, 'removeCache')

    await stickyMessage[1].execute({ client } as BotContext, interaction)

    expect(getCacheSpy).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${channelId}`,
    )
    expect(removeCacheSpy).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${channelId}`,
    )
  })

  it('should find then delete message and remove cache succefully', async () => {
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
  })

  it('should reply user that delete sticky message succefully', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')
    const editReplySpy = vi.spyOn(interaction, 'editReply')

    await stickyMessage[1].execute({ client } as BotContext, interaction)

    expect(editReplySpy).toHaveBeenCalled()
  })

  it('should reply user that not found message in this channel', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    prisma.stickyMessage.delete = vi.fn()
    const removeCahceSpy = vi.spyOn(cache, 'removeCache')
    const editReplySpy = vi.spyOn(interaction, 'editReply')

    await stickyMessage[1].execute({ client } as BotContext, interaction)

    expect(editReplySpy).toHaveBeenCalled()
    expect(prisma.stickyMessage.delete).not.toHaveBeenCalled()
    expect(removeCahceSpy).not.toHaveBeenCalled()
  })

  it('should reply user that error while delete sticky message', async () => {
    vi.spyOn(interaction, 'isChatInputCommand').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    const removeCahceSpy = vi.spyOn(cache, 'removeCache')
    const editReplySpy = vi.spyOn(interaction, 'editReply')

    await stickyMessage[1].execute({ client } as BotContext, interaction)

    expect(editReplySpy).toHaveBeenCalled()
    expect(removeCahceSpy).not.toHaveBeenCalled()
  })
})
