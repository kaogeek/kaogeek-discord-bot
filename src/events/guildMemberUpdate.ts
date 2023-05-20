import { Events } from 'discord.js'

import { Environment } from '../config.js'
import { prisma } from '../prisma.js'
import { defineEventHandler } from '../types/defineEventHandler.js'

const trackingRoles = new Set([Environment.FLAG_ROLE_ID])

export default defineEventHandler({
  eventName: Events.GuildMemberUpdate,
  once: false,
  execute: async (botContext, prev, next) => {
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

      // add flag role to database
      if (trackingRoles.has(roleId)) {
        try {
          await prisma.userRole.create({
            data: {
              roleId,
              userId: next.user.id,
            },
          })
          console.info(`added ${next.user.tag} to ${role.name}`)
        } catch (err) {
          console.error(err)
        }
      }

      console.info(
        `[guildMemberUpdate] "${next.user.tag}" [${next.id}] was given the role "${role.name}" [${role.id}] in "${next.guild.name}" [${next.guild.id}]`,
      )
    }

    for (const roleId of removedRoles) {
      const role = prev.guild.roles.cache.get(roleId)
      if (!role) continue

      // remove flag role from database
      if (trackingRoles.has(roleId)) {
        try {
          await prisma.userRole.delete({
            where: { userId_roleId: { roleId, userId: next.user.id } },
          })
          console.info(`removed ${next.user.tag} from ${role.name}`)
        } catch (err) {
          console.error(err)
        }
      }

      console.info(
        `[guildMemberUpdate] "${next.user.tag}" [${next.id}] was removed from the role "${role.name}" [${role.id}] in "${next.guild.name}" [${next.guild.id}]`,
      )
    }
  },
})
