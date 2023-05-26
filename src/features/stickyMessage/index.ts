import { Events } from 'discord.js'

import { definePlugin } from '@/types/definePlugin'

import { stickyMessageHandler } from './stickyMessageHandler'
import { stickyMessageRemove } from './stickyMessageRemove'
import { stickyMessageSet } from './stickyMessageSet'
import { initStickyMessage } from './stickyMessages'

export default definePlugin({
  name: 'stickyMessage',
  setup: (pluginContext) => {
    pluginContext.addEventHandler({
      eventName: Events.MessageCreate,
      execute: async (botContext, message) =>
        stickyMessageHandler(message, botContext.log),
    })
    pluginContext.addEventHandler({
      eventName: Events.MessageCreate,
      execute: async (botContext, message) =>
        stickyMessageSet(message, botContext.log),
    })
    pluginContext.addEventHandler({
      eventName: Events.MessageCreate,
      execute: async (botContext, message) =>
        stickyMessageRemove(message, botContext.log),
    })
    pluginContext.addInitializer((botContext) =>
      initStickyMessage(botContext.log),
    )
  },
})
