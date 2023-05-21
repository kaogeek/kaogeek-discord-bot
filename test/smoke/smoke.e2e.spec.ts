import { Events, TextChannel } from 'discord.js'

import { describe, expect, it } from 'vitest'

import Bot from '../../src/client'

import SmokeTester from './smoke-client'
import { Environment } from './smoke-config'

describe('bot client', () => {
  it('should successfully connect to a discord server', async () => {
    await expect(new Bot().initAndStart()).resolves.not.toThrowError()
  })
})

describe('smoke tester client', () => {
  it('should successfully connect to a discord server', async () => {
    await expect(new SmokeTester().initAndStart()).resolves.not.toThrowError()
  }, 10000)

  it('should be able to send /ping command and receive response', async () => {
    const bot = new Bot()

    // TODO: Remove me when we have a proper way to send slash command
    bot.on(Events.MessageCreate, (message) => {
      if (message.content !== '/ping') return

      message.reply('pong!')
    })

    await bot.initAndStart()

    const smokeTester = new SmokeTester()
    await smokeTester.initAndStart()

    const channel = await smokeTester.channels.fetch(Environment.MOD_CHANNEL_ID)

    if (!(channel instanceof TextChannel)) {
      throw new Error(
        `Channel ${Environment.MOD_CHANNEL_ID} is not a text channel`,
      )
    }

    // TODO: Find out how to actually send slash command
    await channel.send({ content: '/ping' })

    const messages = await channel.awaitMessages({
      max: 3,
      time: 3000,
    })

    expect(messages.map((msg) => msg.content)).toContain('pong!')
  }, 10000)
})
