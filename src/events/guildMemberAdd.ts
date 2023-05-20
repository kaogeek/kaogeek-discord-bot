import { Events } from 'discord.js'

import { Environment } from '../config.js'
import { prisma } from '../prisma.js'
import { defineEventHandler } from '../types/defineEventHandler.js'

export default defineEventHandler({
  eventName: Events.GuildMemberAdd,
  once: false,
  execute: async (botContext, member) => {
    try {
      const userRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: member.user.id,
            roleId: Environment.FLAG_ROLE_ID,
          },
        },
      })

      if (userRole !== null && userRole.roleId === Environment.FLAG_ROLE_ID) {
        await member.roles.add(userRole.roleId)
        console.info(`flag ${member.user.tag} (rejoin server)`)
      }
    } catch (err) {
      console.error(
        `error while flag ${member.user.tag}: ${(err as Error).message}`,
      )
    }

    console.info(
      `[guildMemberAdd] "${member.user.tag}" [${member.id}] joined "${member.guild.name}" [${member.guild.id}]`,
    )
  },
})
