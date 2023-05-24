import {
  ChannelType,
  Client,
  Message,
  PermissionsBitField,
  TextChannel,
} from 'discord.js'

import { STICKY_CACHE_PREFIX } from '@/features/stickyMessage/index'
import { prisma } from '@/prisma'
import { BotContext } from '@/types/BotContext'
import * as cache from '@/utils/cache'
import { StickyMessage } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import stickyMessage from './stickyMessageSet'

vi.mock('@/config')

describe('stickao-create', () => {
  const channelId = 'test-channel'
  const messageContent = 'MOCK_MESSAGE'
  const messageWithCommand = `?stickao-set ${messageContent}`
  let client: Client
  let message: Message
  let channel: TextChannel
  let sentMessage: Message<true>
  let stickyMessageEntity: StickyMessage
  let authorPermissions: Readonly<PermissionsBitField>

  beforeEach(() => {
    client = {
      channels: {
        cache: {
          get: vi.fn(),
        },
      },
    } as unknown as Client

    channel = {
      send: vi.fn(),
      permissionsFor: vi.fn(),
      type: ChannelType.GuildText,
    } as unknown as TextChannel

    message = {
      channelId,
      channel,
      content: messageWithCommand,
      delete: vi.fn(),
      author: {
        send: vi.fn(),
      },
    } as unknown as Message

    sentMessage = {} as Message<true>

    stickyMessageEntity = {} as StickyMessage

    authorPermissions = { has: vi.fn() } as unknown as PermissionsBitField
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should do noting if input message's prefix is not '?stickao-create'", async () => {
    message.content = messageContent

    prisma.stickyMessage.upsert = vi.fn()

    await stickyMessage.execute({ client } as BotContext, message)

    expect(client.channels.cache.get).not.toHaveBeenCalled()
    expect(message.author.send).not.toHaveBeenCalled()
    expect(channel.send).not.toHaveBeenCalled()
    expect(prisma.stickyMessage.upsert).not.toHaveBeenCalled()
  })

  it('should check that is user has MANAGE_MESSAGE permission before run command', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn()

    await stickyMessage.execute({ client } as BotContext, message)

    expect(channel.permissionsFor).toHaveBeenCalledWith(message.author)
    expect(authorPermissions.has).toHaveBeenCalledWith(
      PermissionsBitField.Flags.ManageMessages,
    )
  })

  it('should deny access if user not has sufficiency permission', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(false)

    prisma.stickyMessage.upsert = vi.fn()

    await stickyMessage.execute({ client } as BotContext, message)

    expect(channel.permissionsFor).toHaveBeenCalledWith(message.author)
    expect(message.author.send).toHaveBeenCalled()
    expect(channel.send).not.toHaveBeenCalled()
    expect(prisma.stickyMessage.upsert).not.toHaveBeenCalled()
  })

  it('should reply error if channel type is not text channel', async () => {
    channel = {
      send: vi.fn(),
      type: ChannelType.GuildVoice,
      permissionsFor: vi.fn(),
    } as unknown as TextChannel

    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    prisma.stickyMessage.upsert = vi.fn()

    await stickyMessage.execute({ client } as BotContext, message)

    expect(message.author.send).toHaveBeenCalled()
    expect(channel.send).not.toHaveBeenCalled()
    expect(prisma.stickyMessage.upsert).not.toHaveBeenCalled()
  })

  it('should send message if input is valid', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn()

    await stickyMessage.execute({ client } as BotContext, message)

    expect(channel.send).toHaveBeenCalledWith({ content: messageContent })
  })

  it('should save message to database and cache after sent message', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalledWith({
      create: {
        messageId: sentMessage.id,
        channelId: channelId,
        message: messageContent,
      },
      update: {
        messageId: sentMessage.id,
        message: messageContent,
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
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).toHaveBeenCalled()
    expect(message.author.send).toHaveBeenCalled()
  })

  it('should reply user that has error when error occur', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'saveCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(message.author.send).toHaveBeenCalled()
  })

  it('should delete command after finish task', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).toHaveBeenCalled()
    expect(message.delete).toHaveBeenCalled()
  })

  it('should delete command if got error while save message to database', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    prisma.stickyMessage.upsert = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'saveCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(message.delete).toHaveBeenCalled()
  })

  it('should delete command if got error while send message to channel', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockRejectedValue(new Error('error occur'))

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.upsert).not.toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(message.delete).toHaveBeenCalled()
  })
})
