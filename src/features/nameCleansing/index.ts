import { Events } from 'discord.js'

import { definePlugin } from '@/types/definePlugin'

import { checkName } from './nameCleansing'

export default definePlugin({
  name: 'nameCleansing',
  setup: (pluginContext) => {
    pluginContext.addEventHandler({
      eventName: Events.GuildMemberAdd,
      execute: async (botContext, member) => {
        await checkName(member, botContext)
      },
    })

    pluginContext.addEventHandler({
      eventName: Events.GuildMemberUpdate,
      execute: async (botContext, oldMember, newMember) => {
        await checkName(newMember, botContext)
      },
    })

    pluginContext.addEventHandler({
      eventName: Events.MessageCreate,
      execute: async (botContext, message) => {
        if (!message.member) return
        await checkName(message.member, botContext)
      },
    })
  },
})
