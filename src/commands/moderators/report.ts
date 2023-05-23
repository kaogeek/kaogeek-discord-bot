import { ApplicationCommandType, TextChannel } from 'discord.js'

import { Environment } from '@/config'
import { isUniqueConstraintViolation, prisma } from '@/prisma'
import { defineCommandHandler } from '@/types/defineCommandHandler'

export default defineCommandHandler({
  data: {
    name: 'Report to moderator',
    type: ApplicationCommandType.Message,
  },
  ephemeral: true,
  execute: async (botContext, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return
    const message = await interaction.channel?.messages.fetch(
      interaction.targetId,
    )
    const member = message?.member
    if (!member) return

    const messageId = message.id
    const reporterId = interaction.user.id
    const reporteeId = member.id

    // TODO: Maybe allow a reason to be specified? e.g. by using a modal
    const reason = 'Reported via context menu'

    // Save the report
    try {
      await prisma.messageReport.create({
        data: { messageId, reporterId, reporteeId, reason },
      })
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        await interaction.editReply({
          embeds: [
            {
              title: 'Error',
              description: 'You have already reported this message',
              color: 0xff_00_00,
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
        where: { reporteeId },
        _count: true,
      })

    // Count the number of times a user has sent a report
    const { _count: reporterReportCount } =
      await prisma.messageReport.aggregate({
        where: { reporterId },
        _count: true,
      })

    // Send the link to the message into the mod channel
    const { client } = botContext
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
          color: 0x00_ff_00,
        },
      ],
    })
  },
})
