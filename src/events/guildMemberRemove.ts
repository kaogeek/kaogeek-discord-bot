import { Events } from 'discord.js'

import { defineEventHandler } from '@/types/defineEventHandler'

export default defineEventHandler({
  eventName: Events.GuildMemberRemove,
  once: false,
  execute: async (botContext, member) => {
    console.info(
      `[guildMemberRemove] "${member.user.tag}" [${member.id}] left "${member.guild.name}" [${member.guild.id}]`,
    )
  },
})
