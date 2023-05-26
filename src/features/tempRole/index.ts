import { Events } from 'discord.js'

import { expireCheck } from '@/features/tempRole/expireCheck'
import { definePlugin } from '@/types/definePlugin'

import { temporaryRoleCommand } from './temporaryRoleCommand'

export default definePlugin({
  name: 'temp-role',
  setup: async (pluginContext) => {
    pluginContext.addCommand(temporaryRoleCommand)

    pluginContext.addEventHandler({
      eventName: Events.ClientReady,
      once: false,
      execute: async (botContext) => {
        await expireCheck(botContext)
      },
    })
  },
})
