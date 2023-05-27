import { Guild, GuildMember, Role } from 'discord.js'

import cron from 'node-cron'

import { Environment } from '@/config'
import { prisma } from '@/prisma'
import { BotContext } from '@/types/BotContext'

export async function expireCheck(botContext: BotContext) {
  await cron.schedule(Environment.TIME_PERIOD_CRON, async () => {
    // Check for expired temporary roles
    const expiredTemporaryRoles = await prisma.tempRole.findMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
      select: {
        guildId: true,
        userId: true,
        roleId: true,
      },
    })
    // Remove expired temporary roles from users
    for (const expiredTemporaryRole of expiredTemporaryRoles) {
      if (expiredTemporaryRole.guildId !== Environment.GUILD_ID) return
      const { client } = botContext

      // Get guild, member, and role
      const guild = client.guilds.cache.get(
        expiredTemporaryRole.guildId,
      ) as Guild
      const member = (await guild.members.fetch(
        expiredTemporaryRole.userId,
      )) as GuildMember
      const role = guild.roles.cache.get(expiredTemporaryRole.roleId) as Role

      try {
        // Remove role from member
        await member.roles.remove(role)

        // Remove expired temporary roles from database
        await prisma.tempRole.deleteMany({
          where: {
            expiresAt: {
              lte: new Date(),
            },
          },
        })
      } catch (error) {
        console.error(
          `Failed to remove role "${role.name}" from "${member.user.tag}"`,
          (error as Error).message,
        )

        //TODO: Send message to moderator
      }
    }
  })
}
