import {
  ChannelType,
  Client,
  Collection,
  DMChannel,
  Message,
  PermissionsBitField,
  TextChannel,
} from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { STICKY_CACHE_PREFIX } from '@/features/stickyMessage/stickyMessages'
import { prisma } from '@/prisma'
import * as cache from '@/utils/cache'
import * as discord from '@/utils/sendDm'

import { stickyMessageSet } from './stickyMessageSet'

vi.mock('@/config')

describe('stickao-set', () => {
  const channelId = 'test-channel'
  const messageContent = 'MOCK_MESSAGE'
  const messageWithCommand = `?stickao-set ${messageContent}`
  let client: Client
  let message: Message
  let channel: TextChannel
  let sentMessage: Message<true>
  let oldMessage: Message<true>
  let oldStickyMessageEntity: StickyMessage
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
      messages: {
        fetch: vi.fn(),
      },
    } as unknown as TextChannel

    message = {
      channelId,
      channel,
      content: messageWithCommand,
      delete: vi.fn(),
      author: {
        send: vi.fn(),
        dmChannel: {} as DMChannel,
      },
    } as unknown as Message

    sentMessage = {} as Message<true>
    oldMessage = {
      id: 'old-message',
      delete: vi.fn(),
    } as unknown as Message<true>

    oldStickyMessageEntity = { messageId: 'old-message' } as StickyMessage

    stickyMessageEntity = {} as StickyMessage

    authorPermissions = { has: vi.fn() } as unknown as PermissionsBitField

    vi.spyOn(discord, 'sendDm')
    prisma.stickyMessage.upsert = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should do noting if input message's prefix is not '?stickao-set'", async () => {
    message.content = messageContent

    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)

    await stickyMessageSet(message)

    expect(client.channels.cache.get).not.toHaveBeenCalled()
    expect(discord.sendDm).not.toHaveBeenCalled()
    expect(channel.send).not.toHaveBeenCalled()
    expect(prisma.stickyMessage.upsert).not.toHaveBeenCalled()
  })

  it('should check that is user has MANAGE_MESSAGE permission before run command', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)

    await stickyMessageSet(message)

    expect(channel.permissionsFor).toHaveBeenCalledWith(message.author)
    expect(authorPermissions.has).toHaveBeenCalledWith(
      PermissionsBitField.Flags.ManageMessages,
    )
  })

  it('should deny access if user not has sufficiency permission', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(false)

    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)

    await stickyMessageSet(message)

    expect(channel.permissionsFor).toHaveBeenCalledWith(message.author)
    expect(discord.sendDm).toHaveBeenCalled()
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
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)

    await stickyMessageSet(message)

    expect(discord.sendDm).toHaveBeenCalled()
    expect(channel.send).not.toHaveBeenCalled()
    expect(prisma.stickyMessage.upsert).not.toHaveBeenCalled()
  })

  it('should send message if input is valid', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)

    await stickyMessageSet(message)

    expect(channel.send).toHaveBeenCalledWith({ content: messageContent })
  })

  it('should save message to database and cache after sent message', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessageSet(message)

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
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessageSet(message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).toHaveBeenCalled()
    expect(discord.sendDm).toHaveBeenCalled()
  })

  it('should reply user that has error when error occur', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    prisma.stickyMessage.upsert = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'saveCache')

    await stickyMessageSet(message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(discord.sendDm).toHaveBeenCalled()
  })

  it('should delete command after finish task', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    prisma.stickyMessage.upsert = vi.fn().mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessageSet(message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).toHaveBeenCalled()
    expect(message.delete).toHaveBeenCalled()
  })

  // TODO: fix test failed spy was not called
  it.skip('should delete old message if it is existed', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    vi.spyOn(message.channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(oldMessage.id, oldMessage),
    )
    vi.spyOn(cache, 'getCache')
      .mockReturnValue(oldStickyMessageEntity)
      .mockResolvedValue(stickyMessageEntity)
    vi.spyOn(cache, 'saveCache')

    await stickyMessageSet(message)

    expect(cache.getCache).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${message.channelId}`,
    )
    expect(message.channel.messages.fetch).toHaveBeenCalledWith(oldMessage.id)
    expect(oldMessage.delete).toHaveBeenCalled()
  })

  it('should delete command if got error while save message to database', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockResolvedValue(sentMessage)
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    prisma.stickyMessage.upsert = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'saveCache')

    await stickyMessageSet(message)

    expect(prisma.stickyMessage.upsert).toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(message.delete).toHaveBeenCalled()
  })

  it('should delete command if got error while send message to channel', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(channel, 'send').mockRejectedValue(new Error('error occur'))

    await stickyMessageSet(message)

    expect(prisma.stickyMessage.upsert).not.toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(message.delete).toHaveBeenCalled()
  })
})
