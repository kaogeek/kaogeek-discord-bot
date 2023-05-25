import {
  DMChannel,
  Message,
  MessageCreateOptions,
  MessagePayload,
} from 'discord.js'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sendDm } from './discord'

vi.mock('@/config')

describe('sendDm', () => {
  let message: Message
  let payload: MessageCreateOptions

  beforeEach(() => {
    message = {
      author: {
        send: vi.fn(),
        dmChannel: {} as DMChannel,
      },
    } as unknown as Message

    payload = {
      content: 'MOCK_MESSAGE',
    } as unknown as MessageCreateOptions
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should send message if user has enabled DM channel', async () => {
    await sendDm(message, payload)

    expect(message.author.send).toHaveBeenCalledWith(payload)
  })

  it('should not send message if user has not enabled DM channel', async () => {
    message = {
      author: {
        send: vi.fn(),
        dmChannel: null,
      },
    } as unknown as Message

    await sendDm(message, payload)

    expect(message.author.send).not.toHaveBeenCalled()
  })
})
