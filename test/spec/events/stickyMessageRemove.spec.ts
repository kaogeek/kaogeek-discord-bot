import { Client, Message } from 'discord.js'

import { STICKY_CACHE_PREFIX } from '@/features/stickyMessage/index.js'
import { prisma } from '@/prisma.js'
import { StickyMessage } from '@prisma/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import stickyMessage from '../../../src/events/stickyMessageRemove.js'
import { BotContext } from '../../../src/types/BotContext.js'
import * as cache from '../../../src/utils/cache.js'

vi.mock('../../../src/config.js', async () => {
  const Environment = {
    MESSAGE_COOLDOWN_SEC: 15,
    MESSAGE_MAX: 5,
  }

  return { Environment }
})

describe('stickao-remove', () => {
  const channelId = 'test-channel'
  const messageContent = 'MOCK_MESSAGE'
  let client: Client
  let message: Message
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
      delete: vi.fn(),
    } as unknown as Message

    stickyMessageEntity = {
      message: messageContent,
    } as unknown as StickyMessage
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should use STICKY_CACHE_PREFIX with channelId as cache key', async () => {
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
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(client.user?.send).toHaveBeenCalled()
  })

  it('should reply to the user that no sticky message was found in the channel', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    vi.spyOn(cache, 'getCache').mockReturnValue(undefined)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(client.user?.send).toHaveBeenCalled()
    expect(prisma.stickyMessage.delete).not.toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
  })

  it('should reply to the user that an error occurred while deleting the sticky message', async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi
      .fn()
      .mockRejectedValue(new Error('error occur'))
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(client.user?.send).toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
  })

  it('should delete command after finish task', async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.delete).toHaveBeenCalled()
    expect(cache.removeCache).toHaveBeenCalled()
    expect(message.delete()).toHaveBeenCalled()
  })

  it('should delete command if got error while delete message', async () => {
    vi.spyOn(cache, 'getCache').mockReturnValue(stickyMessageEntity)
    prisma.stickyMessage.delete = vi.fn()
    vi.spyOn(cache, 'removeCache')

    await stickyMessage.execute({ client } as BotContext, message)

    expect(prisma.stickyMessage.delete).toHaveBeenCalled()
    expect(cache.removeCache).not.toHaveBeenCalled()
    expect(message.delete()).toHaveBeenCalled()
  })
})
