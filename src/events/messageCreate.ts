import { Events } from 'discord.js'

import { checkName } from '@/features/nameChecker'
import { defineEventHandler } from '@/types/defineEventHandler'

export default defineEventHandler({
  eventName: Events.MessageCreate,
  once: true,
  execute: async (botContext, message) => {
    if (message.member) {
      await checkName(
        message.member,
        botContext.runtimeConfiguration.data.nameChecker,
      )
    }
  },
})
