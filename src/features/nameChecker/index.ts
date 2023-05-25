import { Events } from 'discord.js'

import { definePlugin } from '@/types/definePlugin'

import { checkName } from './checkName'

export default definePlugin({
  name: 'nameChecker',
  setup: (pluginContext) => {
    pluginContext.addEventHandler({
      eventName: Events.GuildMemberAdd,
      execute: async (botContext, member) => {
        await checkName(
          member,
          botContext.runtimeConfiguration.data.nameChecker,
        )
      },
    })

    pluginContext.addEventHandler({
      eventName: Events.GuildMemberUpdate,
      execute: async (botContext, oldMember, newMember) => {
        await checkName(
          newMember,
          botContext.runtimeConfiguration.data.nameChecker,
        )
      },
    })

    pluginContext.addEventHandler({
      eventName: Events.MessageCreate,
      execute: async (botContext, message) => {
        if (!message.member) {
          return
        }
        await checkName(
          message.member,
          botContext.runtimeConfiguration.data.nameChecker,
        )
      },
    })
  },
})
