import { ApplicationCommandType, TextChannel } from 'discord.js'

import { Environment } from '../../config.js'
import { keyv } from '../../keyv.js'
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

    const increment = async (key: string) => {
      const count = (await keyv.get(key)) ?? 0
      await keyv.set(key, count + 1)
      return count + 1
    }

    // Count the number of times a message has been reported
    const messageReportCount = await increment(
      `reportCount:message:${message.id}`,
    )

    // TODO: Count the number of times a user has been reported
    const reporteeCount = await increment(`reporteeCount:user:${member.id}`)

    // TODO: Count the number of times a user has reported
    const reporterCount = await increment(
      `reporterCount:user:${interaction.user.id}`,
    )

    // Send the link to the message into the mod channel
    const channel = client.channels.cache.get(Environment.MOD_CHANNEL_ID)
    if (!(channel instanceof TextChannel)) return
    await channel.send(
      [
        `Reported message: https://discord.com/channels/${interaction.guild.id}/${interaction.channelId}/${interaction.targetId} (reported ${messageReportCount} times)`,
        `Message author: ${member.user} (reported ${reporteeCount} times)`,
        `Reported by: ${interaction.user} (sent ${reporterCount} reports)`,
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
