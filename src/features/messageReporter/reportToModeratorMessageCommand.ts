import {
  ActionRowBuilder,
  ApplicationCommandType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'

import { Environment } from '@/config'
import { isUniqueConstraintViolation, prisma } from '@/prisma'
import { defineCommand } from '@/types/defineCommand'

export const reportToModeratorMessageCommand = defineCommand({
  data: {
    name: 'Report to moderator',
    type: ApplicationCommandType.Message,
  },
  disableAutoDeferReply: true,
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

    const reasonModal = new ModalBuilder()
      .setCustomId('reasonModal')
      .setTitle('Report to moderator')

    const reasonInput = new TextInputBuilder()
      .setCustomId('reasonInput')
      .setLabel('Reason')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(100)

    reasonModal.addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        reasonInput,
      ),
    )

    // Show the modal
    await interaction.showModal(reasonModal)

    const submitted = await interaction.awaitModalSubmit({
      filter: (interaction_) => interaction_.user.id === interaction.user.id,
      time: 0,
    })

    const reason = submitted.fields.getTextInputValue('reasonInput')

    if (!submitted) return

    try {
      // Save the report
      await prisma.messageReport.create({
        data: { messageId, reporterId, reporteeId, reason },
      })

      // Tell the user that the report was sent
      await submitted.reply({
        embeds: [
          {
            title: 'Thanks!',
            description: 'Report sent to moderators',
            color: 0x00_ff_00,
          },
        ],
        ephemeral: true,
      })
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        await submitted.reply({
          embeds: [
            {
              title: 'Error',
              description: 'You have already reported this message',
              color: 0xff_00_00,
            },
          ],
          ephemeral: true,
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
    await channel.send({
      embeds: [
        {
          fields: [
            {
              name: 'Reported message',
              value: `https://discord.com/channels/${interaction.guild.id}/${interaction.channelId}/${interaction.targetId} (reported ${messageReportCount} times)`,
            },
            {
              name: 'Message author',
              value: `${member.user} (reported ${reporteeReportCount} times)`,
              inline: true,
            },
            {
              name: 'Reported by',
              value: `${interaction.user} (sent ${reporterReportCount} reports)`,
              inline: true,
            },
            {
              name: 'Reason',
              value: reason,
            },
          ],
        },
      ],
    })
  },
})
