import { Events } from 'discord.js'

import { EventHandlerConfig } from '../types/EventHandlerConfig.js'

export default {
  eventName: Events.GuildMemberAdd,
  once: false,
  execute: async (_client, member) => {
    console.info(
      `[guildMemberAdd] "${member.user.tag}" [${member.id}] joined "${member.guild.name}" [${member.guild.id}]`,
    )
  },
} satisfies EventHandlerConfig<Events.GuildMemberAdd>
