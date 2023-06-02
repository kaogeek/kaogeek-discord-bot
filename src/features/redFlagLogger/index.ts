import { Events } from 'discord.js'

import { prisma } from '@/prisma'
import { definePlugin } from '@/types/definePlugin'

export default definePlugin({
  name: 'redFlagLogger',
  setup: (pluginContext) => {
    pluginContext.addEventHandler({
      eventName: Events.MessageReactionAdd,
      once: false,
      execute: async (botContext, reaction, user) => {
        const redFlagEmojiIdentifier = '%F0%9F%9F%A5' // 🟥
        if (reaction.emoji.identifier !== redFlagEmojiIdentifier) return
        const author = reaction.message.author
        if (!author) return
        const channel = reaction.message.channel
        if (!channel) return
        botContext.log.info(
          `actor=${user.id} message=${reaction.message.id} messageAuthor=${author.id}`,
        )
        await prisma.redFlag.create({
          data: {
            actorId: user.id,
            flaggedChannelId: reaction.message.channel.id,
            flaggedMessageId: reaction.message.id,
            flaggedUserId: author.id,
          },
        })
      },
    })
  },
})
