import { ApplicationCommandType, TextChannel } from 'discord.js'

import { Environment } from '../../config.js'
import { Prisma, prisma } from '../../prisma.js'
import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'

export default {
  data: {
    name: 'Report to moderator',
    type: ApplicationCommandType.Message,
  },
  ephemeral: true,
  execute: async (client, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return
    const message = await interaction.channel?.messages.fetch(
      interaction.targetId,
    )
    const member = message?.member
    if (!member) return

    const messageId = BigInt(message.id)
    const reporterMemberId = BigInt(interaction.user.id)
    const reporteeMemberId = BigInt(member.id)

    // Save the report
    try {
      await prisma.messageReport.create({
        data: {
          messageId,
          reporterId: reporterMemberId,
          reporteeId: reporteeMemberId,
          reason: 'Reported via context menu',
        },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        await interaction.editReply({
          embeds: [
            {
              title: 'Error',
              description: 'You have already reported this message',
              color: 0xff0000,
            },
          ],
        })
        return
      }
    }

    // Count the number of times a message has been reported
    const { _count: messageReportCount } = await prisma.messageReport.aggregate(
      {
        where: { messageId },
        _count: true,
      },
    )

    // Count the number of times a user has been reported
    const { _count: reporteeReportCount } =
      await prisma.messageReport.aggregate({
        where: { reporteeId: reporteeMemberId },
        _count: true,
      })

    // Count the number of times a user has sent a report
    const { _count: reporterReportCount } =
      await prisma.messageReport.aggregate({
        where: { reporterId: reporterMemberId },
        _count: true,
      })

    // Send the link to the message into the mod channel
    const channel = client.channels.cache.get(Environment.MOD_CHANNEL_ID)
    if (!(channel instanceof TextChannel)) return
    await channel.send(
      [
        `Reported message: https://discord.com/channels/${interaction.guild.id}/${interaction.channelId}/${interaction.targetId} (reported ${messageReportCount} times)`,
        `Message author: ${member.user} (reported ${reporteeReportCount} times)`,
        `Reported by: ${interaction.user} (sent ${reporterReportCount} reports)`,
      ].join('\n'),
    )

    // Tell the user that the report was sent
    await interaction.editReply({
      embeds: [
        {
          title: 'Thanks!',
          description: 'Report sent to moderators',
          color: 0x00ff00,
        },
      ],
    })
  },
} satisfies CommandHandlerConfig
