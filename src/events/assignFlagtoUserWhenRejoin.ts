import { Events } from 'discord.js'

import { Environment } from '../config.js'
import { prisma } from '../prisma.js'
import { EventHandlerConfig } from '../types/EventHandlerConfig.js'

export default {
  eventName: Events.GuildMemberAdd,
  once: false,
  execute: async (client, newMember) => {
    try {
      const userRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: newMember.user.id,
            roleId: Environment.FLAG_ROLE_ID,
          },
        },
      })

      if (userRole !== null && userRole.roleId === Environment.FLAG_ROLE_ID) {
        await newMember.roles.add(userRole.roleId)
        console.info(`flag ${newMember.user.tag} (rejoin server)`)
      }
    } catch (err) {
      console.error(
        `error while flag ${newMember.user.tag}: ${(err as Error).message}`,
      )
    }
  },
} satisfies EventHandlerConfig<Events.GuildMemberAdd>
