import { Message } from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import * as stickyMessage from '../../../../src/features/stickyMessage'
import * as lockChannel from '../../../../src/features/stickyMessage/lockChannel'
import {
  resetCooldown,
  startCooldown,
} from '../../../../src/features/stickyMessage/messageCooldown'

vi.mock('../../../../src/config.js', async () => {
  const Environment = {
    MESSAGE_COOLDOWN_SEC: 15,
    MESSAGE_MAX: 5,
  }

  return { Environment }
})

vi.mock('../../../../src/features/stickyMessage/index', async () => {
  const pushMessageToBottom = vi.fn()

  return { pushMessageToBottom }
})

describe('startCooldown', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should start the cooldown for the specified channel', async () => {
    const channelId = '123456789'

    const lockChannelSpy = vi.spyOn(lockChannel, 'lockChannel')

    startCooldown(channelId)

    expect(lockChannelSpy).toHaveBeenCalledWith(
      channelId,
      lockChannel.ChannelLockType.COOLDOWN,
    )
  })

  it('should unlock channel when timeout', async () => {
    const message = {
      channelId: '123456789',
    } as unknown as Message
    const stickyMessageEntity = {} as unknown as StickyMessage

    const lockChannelSpy = vi.spyOn(lockChannel, 'lockChannel')
    const unlockChannelSpy = vi.spyOn(lockChannel, 'unlockChannel')
    const pushMessageToBottomSpy = vi.spyOn(
      stickyMessage,
      'pushMessageToBottom',
    )

    // Mock the setTimeout function to immediately trigger the callback
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback()
      return {} as unknown as NodeJS.Timeout
    })

    await resetCooldown(message, stickyMessageEntity)

    expect(lockChannelSpy).toHaveBeenCalledWith(
      message.channelId,
      lockChannel.ChannelLockType.COOLDOWN,
    )
    expect(unlockChannelSpy).toHaveBeenCalledWith(
      message.channelId,
      lockChannel.ChannelLockType.COOLDOWN,
    )
    expect(pushMessageToBottomSpy).toHaveBeenCalledWith(
      message,
      stickyMessageEntity,
    )
  })
})

describe('resetCooldown', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should lock channel when not timeout', async () => {
    const message = {
      channelId: '123456789',
    } as unknown as Message
    const stickyMessage = {} as unknown as StickyMessage

    const lockChannelSpy = vi.spyOn(lockChannel, 'lockChannel')

    await resetCooldown(message, stickyMessage)

    expect(lockChannelSpy).toHaveBeenCalledWith(
      message.channelId,
      lockChannel.ChannelLockType.COOLDOWN,
    )
  })

  it('should reset the cooldown and push the message to the bottom when timeout', async () => {
    const message = {
      channelId: '123456789',
    } as unknown as Message
    const stickyMessageEntity = {} as unknown as StickyMessage

    const lockChannelSpy = vi.spyOn(lockChannel, 'lockChannel')
    const unlockChannelSpy = vi.spyOn(lockChannel, 'unlockChannel')
    const pushMessageToBottomSpy = vi.spyOn(
      stickyMessage,
      'pushMessageToBottom',
    )

    // Mock the setTimeout function to immediately trigger the callback
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback()
      return {} as unknown as NodeJS.Timeout
    })

    await resetCooldown(message, stickyMessageEntity)

    expect(lockChannelSpy).toHaveBeenCalledWith(
      message.channelId,
      lockChannel.ChannelLockType.COOLDOWN,
    )
    expect(unlockChannelSpy).toHaveBeenCalledWith(
      message.channelId,
      lockChannel.ChannelLockType.COOLDOWN,
    )
    expect(pushMessageToBottomSpy).toHaveBeenCalledWith(
      message,
      stickyMessageEntity,
    )
  })
})
