import { Events } from 'discord.js'

import { Environment } from '../config.js'
import { prisma } from '../prisma.js'
import { EventHandlerConfig } from '../types/EventHandlerConfig.js'

const trackingRole = new Set([Environment.FLAG_ROLE_ID])

export default {
  eventName: Events.GuildMemberUpdate,
  once: false,
  execute: async (client, oldMember, newMember) => {
    const oldRoles = oldMember.roles.cache
    const newRoles = newMember.roles.cache

    //? Assume that an event can be only one (addRole or removeRole)
    // save user role to database
    for (const [roleId, role] of newRoles) {
      if (trackingRole.has(roleId) && !oldRoles.has(roleId)) {
        try {
          await prisma.userRole.create({
            data: {
              roleId: roleId,
              userId: newMember.user.id,
            },
          })
          console.info(`added ${newMember.user.tag} to ${role.name}`)
        } catch (err) {
          console.error(err)
        }
      }
    }

    // delete user role from database
    for (const [roleId, role] of oldRoles) {
      if (trackingRole.has(roleId) && !newRoles.has(roleId)) {
        try {
          await prisma.userRole.delete({
            where: { userId_roleId: { roleId, userId: newMember.user.id } },
          })
          console.info(`removed ${newMember.user.tag} from ${role.name}`)
        } catch (err) {
          console.error(err)
        }
      }
    }
  },
} satisfies EventHandlerConfig<Events.GuildMemberUpdate>
