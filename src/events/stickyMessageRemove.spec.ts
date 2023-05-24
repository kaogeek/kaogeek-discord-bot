import { Client, Message, PermissionsBitField, TextChannel } from 'discord.js'

import { STICKY_CACHE_PREFIX } from '@/features/stickyMessage/index'
import { prisma } from '@/prisma'
import { BotContext } from '@/types/BotContext'
import * as cache from '@/utils/cache'
import { StickyMessage } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import stickyMessage from './stickyMessageRemove'

vi.mock('@/config')

describe('stickao-remove', () => {
  const channelId = 'test-channel'
  const messageContent = 'MOCK_MESSAGE'
  const messageWithCommand = `?stickao-remove ${messageContent}`
  let client: Client
  let message: Message
  let channel: TextChannel
  let stickyMessageEntity: StickyMessage
  let authorPermissions: Readonly<PermissionsBitField>

  beforeEach(() => {
    client = {
      channels: {
        cache: {
          get: vi.fn(),
        },
        permissionFor: vi.fn(),
      },
    } as unknown as Client

    channel = {
      permissionsFor: vi.fn(),
    } as unknown as TextChannel

    message = {
      channelId,
      channel,
      delete: vi.fn(),
      content: messageWithCommand,
      author: {
        send: vi.fn(),
      },
    } as unknown as Message

    stickyMessageEntity = {
      message: messageContent,
    } as StickyMessage

    authorPermissions = { has: vi.fn() } as unknown as PermissionsBitField
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should check that is user has MANAGE_MESSAGE permission before run command', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(channel.permissionsFor).toHaveBeenCalledWith(message.author)
    expect(authorPermissions.has).toHaveBeenCalledWith(
      PermissionsBitField.Flags.ManageMessages,
    )
  })

  it('should deny access if user not has sufficiency permission', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(false)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(channel.permissionsFor).toHaveBeenCalledWith(message.author)
    expect(message.author.send).toHaveBeenCalled()
    expect(prisma.stickyMessage.delete).not.toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
  })

  it("should do noting if input message's prefix is not '?stickao-remove'", async () => {
    message.content = messageContent

    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(message.author.send).not.toHaveBeenCalled()
    expect(prisma.stickyMessage.delete).not.toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
  })

  it('should use STICKY_CACHE_PREFIX with channelId as cache key', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(cache.getCache).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${channelId}`,
    )
    expect(cache.removeCache).toHaveBeenCalledWith(
      `${STICKY_CACHE_PREFIX}-${channelId}`,
    )
  })

  it('should find then delete message and remove cache successfully', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.delete).toHaveBeenCalledWith({
      where: {
        channelId: channelId,
      },
    })
    expect(cache.removeCache).toHaveBeenCalled()
  })

  it('should reply to the user that the sticky message was deleted successfully', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(message.author.send).toHaveBeenCalled()
  })

  it('should reply to the user that no sticky message was found in the channel', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(message.author.send).toHaveBeenCalled()
    expect(prisma.stickyMessage.delete).not.toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
  })

  it('should reply to the user that an error occurred while deleting the sticky message', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(message.author.send).toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
  })

  it('should delete command after finish task', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.delete).toHaveBeenCalled()
    expect(cache.removeCache).toHaveBeenCalled()
    expect(message.delete).toHaveBeenCalled()
  })

  it('should delete command if got error while delete message', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.delete).toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
    expect(message.delete).toHaveBeenCalled()
  })
})
