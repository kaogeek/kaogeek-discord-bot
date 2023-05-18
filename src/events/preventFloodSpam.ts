import { Events } from 'discord.js'

import { Environment } from '../config'
import { keyv } from '../keyv'
import { EventHandlerConfig } from '../types/EventHandlerConfig'

type MsgInfo = {
  firstMsgTime: number
  accumulate: number
}

export default {
  eventName: Events.MessageCreate,
  once: false,
  execute: async (client, message) => {
    // skip bot message
    if (message.author.id === client.user?.id) return

    const key = `message:spamAccumulate:${message.channel.id};${message.author.id}`
    const msgInfo: MsgInfo = (await keyv.get(key)) ?? null
    if (msgInfo === null) {
      await keyv.set(
        key,
        {
          firstMsgTime: message.createdAt.getTime(),
          accumulate: 1,
        } satisfies MsgInfo,
        Environment.FLOOD_SPAM_MAX_TIME_MS,
      )
      return
    }
    if (msgInfo.accumulate === Environment.FLOOD_SPAM_MAX_MESSAGES) {
      // accumulate full, check if the first message still in time limit
      const deltaMs = message.createdAt.getTime() - msgInfo.firstMsgTime
      if (deltaMs < Environment.FLOOD_SPAM_MAX_TIME_MS) {
        try {
          message.delete()
        } catch (err) {
          console.error(err)
        }
      } else {
        // reset if first message not in time limit
        await keyv.set(
          key,
          {
            firstMsgTime: message.createdAt.getTime(),
            accumulate: 1,
          } satisfies MsgInfo,
          Environment.FLOOD_SPAM_MAX_TIME_MS,
        )
      }
      return
    }
    await keyv.set(
      key,
      {
        firstMsgTime: msgInfo.firstMsgTime,
        accumulate: msgInfo.accumulate + 1,
      } satisfies MsgInfo,
      Environment.FLOOD_SPAM_MAX_TIME_MS,
    )
  },
} satisfies EventHandlerConfig<Events.MessageCreate>
