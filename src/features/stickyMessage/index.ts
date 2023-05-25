import { Events } from 'discord.js'

import { definePlugin } from '@/types/definePlugin'

import { stickyMessageHandler } from './stickyMessageHandler'
import { stickyMessageRemove } from './stickyMessageRemove'
import { stickyMessageSet } from './stickyMessageSet'

export default definePlugin({
  name: 'stickyMessage',
  setup: (pluginContext) => {
    pluginContext.addEventHandler({
      eventName: Events.MessageCreate,
      execute: async (_botContext, message) => stickyMessageHandler(message),
    })
    pluginContext.addEventHandler({
      eventName: Events.MessageCreate,
      execute: async (_botContext, message) => stickyMessageSet(message),
    })
    pluginContext.addEventHandler({
      eventName: Events.MessageCreate,
      execute: async (_botContext, message) => stickyMessageRemove(message),
    })
  },
})
