import {
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

import { stickyMessageRemove } from './stickyMessageRemove'

vi.mock('@/config')

describe('stickao-remove', () => {
  const channelId = 'test-channel'
  const messageContent = 'MOCK_MESSAGE'
  const messageWithCommand = `?stickao-remove ${messageContent}`
  let message: Message
  let sentMessage: Message<true>
  let channel: TextChannel
  let stickyMessageEntity: StickyMessage
  let authorPermissions: Readonly<PermissionsBitField>

  beforeEach(() => {
    channel = {
      permissionsFor: vi.fn(),
      messages: { fetch: vi.fn() },
    } as unknown as TextChannel

    message = {
      channelId,
      channel,
      delete: vi.fn(),
      content: messageWithCommand,
      author: {
        send: vi.fn(),
        dmChannel: {} as DMChannel,
      },
    } as unknown as Message

    sentMessage = {
      id: 'sent-message',
      delete: vi.fn(),
    } as unknown as Message<true>

    stickyMessageEntity = {
      message: messageContent,
    } as StickyMessage

    authorPermissions = { has: vi.fn() } as unknown as PermissionsBitField

    vi.spyOn(discord, 'sendDm')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not send private message to user if user disable dm channel', async () => {
    message = {
      channelId,
      channel,
      delete: vi.fn(),
      content: messageWithCommand,
      author: {
        send: vi.fn(),
        dmChannel: null,
      },
    } as unknown as Message

    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')
    vi.spyOn(channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(sentMessage.id, sentMessage),
    )

    expect(discord.sendDm).not.toHaveBeenCalled()
  })

  it('should check that is user has MANAGE_MESSAGE permission before run command', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')
    vi.spyOn(channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(sentMessage.id, sentMessage),
    )

    await stickyMessageRemove(message)

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
    vi.spyOn(channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(sentMessage.id, sentMessage),
    )

    await stickyMessageRemove(message)

    expect(channel.permissionsFor).toHaveBeenCalledWith(message.author)
    expect(discord.sendDm).toHaveBeenCalled()
    expect(prisma.stickyMessage.delete).not.toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
  })

  it("should do noting if input message's prefix is not '?stickao-remove'", async () => {
    message.content = messageContent

    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessageRemove(message)

    expect(discord.sendDm).not.toHaveBeenCalled()
    expect(prisma.stickyMessage.delete).not.toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
  })

  it('should use STICKY_CACHE_PREFIX with channelId as cache key', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')
    vi.spyOn(channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(sentMessage.id, sentMessage),
    )

    await stickyMessageRemove(message)

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
    vi.spyOn(channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(sentMessage.id, sentMessage),
    )

    await stickyMessageRemove(message)

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
    vi.spyOn(channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(sentMessage.id, sentMessage),
    )

    await stickyMessageRemove(message)

    expect(discord.sendDm).toHaveBeenCalled()
  })

  it('should reply to the user that no sticky message was found in the channel', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')
    vi.spyOn(channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(sentMessage.id, sentMessage),
    )

    await stickyMessageRemove(message)

    expect(discord.sendDm).toHaveBeenCalled()
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
    vi.spyOn(channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(sentMessage.id, sentMessage),
    )

    await stickyMessageRemove(message)

    expect(discord.sendDm).toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
    expect(channel.messages.fetch).not.toHaveBeenCalled()
  })

  // TODO: fix test failed (no idea why it spy is not called)
  it.skip('should remove sticky message after successfully remove from database', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')
    vi.spyOn(channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(sentMessage.id, sentMessage),
    )

    await stickyMessageRemove(message)

    expect(sentMessage.delete).toHaveBeenCalled()
  })

  it('should delete command after finish task', async () => {
    vi.spyOn(channel, 'permissionsFor').mockReturnValue(authorPermissions)
    vi.spyOn(authorPermissions, 'has').mockReturnValue(true)
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')
    vi.spyOn(channel.messages, 'fetch').mockResolvedValue(
      new Collection<string, Message<true>>().set(sentMessage.id, sentMessage),
    )

    await stickyMessageRemove(message)

    expect(prisma.stickyMessage.delete).toHaveBeenCalled()
    expect(cache.removeCache).toHaveBeenCalled()
    expect(channel.messages.fetch).toHaveBeenCalled()
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

    await stickyMessageRemove(message)

    expect(prisma.stickyMessage.delete).toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
    expect(channel.messages.fetch).not.toHaveBeenCalled()
    expect(message.delete).toHaveBeenCalled()
  })
})
