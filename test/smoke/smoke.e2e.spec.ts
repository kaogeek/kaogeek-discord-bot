import { TextChannel } from 'discord.js'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { Bot } from '../../src/Bot.js'

import { Environment } from './smoke-config.js'
import { SmokeTesterBot } from './smoke-tester-bot.js'

let bot: Bot
let smokeTesterBot: SmokeTesterBot

beforeEach(() => {
  bot = new Bot()
  smokeTesterBot = new SmokeTesterBot()
})

afterEach(async () => {
  // Remove all listeners instead of client.destroy() since destroy() does not work
  bot.client.removeAllListeners()
  smokeTesterBot.client.removeAllListeners()
})

describe('bot client', () => {
  it('should successfully connect to a discord server', async () => {
    await expect(bot.initAndStart()).resolves.not.toThrowError()
  })
})

describe('smoke tester client', () => {
  it('should successfully connect to a discord server', async () => {
    await expect(smokeTesterBot.initAndStart()).resolves.not.toThrowError()
  }, 10000)

  // Slash commands cannot be tested by another bots
  // So we test only message listeners e.g. preventEmojiSpam
  it('should be able to handle emoji spam', async () => {
    await bot.initAndStart()
    await smokeTesterBot.initAndStart()

    const channel = await smokeTesterBot.client.channels.fetch(
      Environment.MOD_CHANNEL_ID,
    )

    if (!(channel instanceof TextChannel)) {
      throw new Error(
        `Channel ${Environment.MOD_CHANNEL_ID} is not a text channel`,
      )
    }

    // Test by posting normal message
    const normalMessage = await channel.send({
      content: `Smoke testing: ${new Date()}`,
    })

    // Wait for bot
    await new Promise((resolve) => setTimeout(resolve, 500))

    await expect(
      channel.messages.fetch(normalMessage.id),
    ).resolves.not.toThrowError()

    // Test by spamming emoji
    const message = await channel.send({ content: '🫠' })

    // Wait for bot to delete the message
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Message should be deleted
    await expect(channel.messages.fetch(message.id)).rejects.toThrowError(
      'Unknown Message',
    )
  }, 10000)
})
