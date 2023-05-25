import { Events } from 'discord.js'

import { checkName } from '@/features/nameChecker'
import { defineEventHandler } from '@/types/defineEventHandler'

export default defineEventHandler({
  eventName: Events.GuildMemberAdd,
  once: false,
  execute: async (botContext, member) => {
    console.info(
      `[guildMemberAdd] "${member.user.tag}" [${member.id}] joined "${member.guild.name}" [${member.guild.id}]`,
    )
    await checkName(member, botContext.runtimeConfiguration.data.nameChecker)
  },
})
