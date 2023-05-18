import { ApplicationCommandType, TextChannel } from 'discord.js'

import { Environment } from '../../config.js'
import { prisma } from '../../prisma.js'
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

    // Count the number of times a message has been reported
    const messageReportCount = await prisma.messageReportCount.upsert({
      where: { messageId },
      update: { count: { increment: 1 } },
      create: { messageId, count: 1 },
    })

    const reporteeMemberId = BigInt(member.id)

    // Count the number of times a user has been reported
    const reporteeReportCount = await prisma.reporteeReportCount.upsert({
      where: { userId: reporteeMemberId },
      update: { count: { increment: 1 } },
      create: { userId: reporteeMemberId, count: 1 },
    })

    const reporterMemberId = BigInt(interaction.user.id)

    // Count the number of times a user has reported
    const reporterReportCount = await prisma.reporterReportCount.upsert({
      where: { userId: reporterMemberId },
      update: { count: { increment: 1 } },
      create: { userId: reporterMemberId, count: 1 },
    })

    // Send the link to the message into the mod channel
    const channel = client.channels.cache.get(Environment.MOD_CHANNEL_ID)
    if (!(channel instanceof TextChannel)) return
    await channel.send(
      [
        `Reported message: https://discord.com/channels/${interaction.guild.id}/${interaction.channelId}/${interaction.targetId} (reported ${messageReportCount.count} times)`,
        `Message author: ${member.user} (reported ${reporteeReportCount.count} times)`,
        `Reported by: ${interaction.user} (sent ${reporterReportCount.count} reports)`,
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
