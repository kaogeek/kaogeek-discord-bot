import { Events } from 'discord.js'

import { definePlugin } from '@/types/definePlugin'
import isOnlyEmoji from '@/utils/isOnlyEmoji'

import { isEmojiPreventionEnabled } from './isEmojiPreventionEnabled'

export default definePlugin({
  name: 'preventEmojiSpam',
  setup: (pluginContext) => {
    pluginContext.addEventHandler({
      eventName: Events.MessageCreate,
      once: false,
      execute: async (botContext, message) => {
        const { runtimeConfiguration, log } = botContext
        const config = runtimeConfiguration.data.preventEmojiSpam
        // if has only emoji -> delete message
        if (isOnlyEmoji(message.content) && message.member) {
          try {
            log.info(
              `Message with only emoji: ${message.id} by ${message.member}`,
            )
            if (
              isEmojiPreventionEnabled(config, message.channel, message.member)
            ) {
              await message.delete()
            }
          } catch (error) {
            log.error('Unable to process message', error)
          }
        }
      },
    })
  },
})
