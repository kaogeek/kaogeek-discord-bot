import { Events } from 'discord.js'

import { EventHandlerConfig } from '../types/EventHandlerConfig.js'

export default {
  eventName: Events.GuildMemberRemove,
  once: false,
  execute: async (_client, member) => {
    console.info(
      `[guildMemberRemove] "${member.user.tag}" [${member.id}] left "${member.guild.name}" [${member.guild.id}]`,
    )
  },
} satisfies EventHandlerConfig<Events.GuildMemberRemove>
