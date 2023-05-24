import { TextChannel } from 'discord.js'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { Bot } from '../../src/Bot.js'

import { Environment } from './SmokeConfig.js'
import { SmokeTesterBot } from './SmokeTesterBot.js'

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
  }, 20_000)
})

describe('smoke tester client', () => {
  it('should successfully connect to a discord server', async () => {
    await expect(smokeTesterBot.initAndStart()).resolves.not.toThrowError()
  }, 20_000)

  // Slash commands cannot be tested by another bots
  // So we test only message listeners e.g. preventEmojiSpam
  it('should be able to handle emoji spam', async () => {
    await bot.initAndStart()
    await smokeTesterBot.initAndStart()

    const channel = await smokeTesterBot.client.channels.fetch(
      Environment.MOD_CHANNEL_ID,
    )

    if (!(channel instanceof TextChannel)) {
      throw new TypeError(
        `Channel ${Environment.MOD_CHANNEL_ID} is not a text channel`,
      )
    }

    // Test by posting normal message
    const normalMessage = await channel.send({
      content: `Smoke testing: ${new Date()}`,
    })

    // Test by spamming emoji
    const spamMessage = await channel.send({ content: '🫠' })

    // Wait for bot to delete the spam message
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Normal message should not be deleted
    await expect(
      channel.messages.fetch(normalMessage.id),
    ).resolves.not.toThrowError()

    // Spam message should be deleted
    await expect(channel.messages.fetch(spamMessage.id)).rejects.toThrowError(
      'Unknown Message',
    )
  }, 20_000)
})
