import { Events } from 'discord.js'

import { EventHandlerConfig } from '../types/EventHandlerConfig.js'

export default {
  eventName: Events.GuildMemberUpdate,
  once: false,
  execute: async (_client, prev, next) => {
    if (prev.nickname !== next.nickname) {
      if (!prev.nickname) {
        console.info(
          `[guildMemberUpdate] "${next.user.tag}" [${next.id}] set their nickname to "${next.nickname}" in "${next.guild.name}" [${next.guild.id}]`,
        )
      } else if (!next.nickname) {
        console.info(
          `[guildMemberUpdate] "${next.user.tag}" [${next.id}] removed their nickname "${prev.nickname}" in "${next.guild.name}" [${next.guild.id}]`,
        )
      } else {
        console.info(
          `[guildMemberUpdate] "${next.user.tag}" [${next.id}] changed nickname from "${prev.nickname}" to "${next.nickname}" in "${next.guild.name}" [${next.guild.id}]`,
        )
      }
    }
    const prevRoles = new Set(prev.roles.cache.map((role) => role.id))
    const nextRoles = new Set(next.roles.cache.map((role) => role.id))
    const addedRoles = [...nextRoles].filter((role) => !prevRoles.has(role))
    const removedRoles = [...prevRoles].filter((role) => !nextRoles.has(role))
    for (const roleId of addedRoles) {
      const role = next.guild.roles.cache.get(roleId)
      if (!role) continue
      console.info(
        `[guildMemberUpdate] "${next.user.tag}" [${next.id}] was given the role "${role.name}" [${role.id}] in "${next.guild.name}" [${next.guild.id}]`,
      )
    }
    for (const roleId of removedRoles) {
      const role = prev.guild.roles.cache.get(roleId)
      if (!role) continue
      console.info(
        `[guildMemberUpdate] "${next.user.tag}" [${next.id}] was removed from the role "${role.name}" [${role.id}] in "${next.guild.name}" [${next.guild.id}]`,
      )
    }
  },
} satisfies EventHandlerConfig<Events.GuildMemberUpdate>
