import {
  DMChannel,
  DiscordAPIError,
  Message,
  MessageCreateOptions,
} from 'discord.js'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sendDm } from './sendDm'

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

  it('should send message if user has has DM channel', async () => {
    await sendDm(message, payload)

    expect(message.author.send).toHaveBeenCalledWith(payload)
  })

  it('should create new DM channel and send message if not exist', async () => {
    message = {
      author: {
        send: vi.fn(),
        createDM: vi.fn(),
        dmChannel: null,
      },
    } as unknown as Message

    await sendDm(message, payload)

    expect(message.author.createDM).toHaveBeenCalled()
    expect(message.author.send).toHaveBeenCalledWith(payload)
  })

  it.each([
    {
      // mock discord error code 50007
      err: new DiscordAPIError(
        {
          code: 50_007,
          message: 'cannot send message to user',
        },
        50_007,
        400,
        'POST',
        '',
        {},
      ),
    },
    {
      // mock discord other error
      err: new DiscordAPIError(
        {
          code: 1,
          message: 'cannot send message to user',
        },
        1,
        400,
        'POST',
        '',
        {},
      ),
    },
  ])(
    'should not send message if user has not enabled DM channel or got any error',
    async ({ err }) => {
      message = {
        author: {
          send: vi.fn(),
          createDM: vi.fn(),
          dmChannel: null,
        },
      } as unknown as Message

      vi.spyOn(message.author, 'createDM').mockRejectedValue(err)

      await sendDm(message, payload)

      expect(message.author.send).not.toHaveBeenCalled()
    },
  )
})
