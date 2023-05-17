import { ApplicationCommandType, TextChannel } from 'discord.js'

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

    const modChannel = '1108458721589342258'

    // TODO: Count the number of times a message has been reported
    // TODO: Count the number of times a user has been reported
    // TODO: Count the number of times a user has reported

    // Send the link to the message into the mod channel
    const channel = client.channels.cache.get(modChannel)
    if (!(channel instanceof TextChannel)) return
    await channel.send(
      [
        `Reported message: https://discord.com/channels/${interaction.guild.id}/${interaction.channelId}/${interaction.targetId}`,
        `Message author: ${member.user}`,
        `Reported by: ${interaction.user}`,
      ].join('\n'),
    )

    // Tell the user that the report was sent
    await interaction.editReply('Report sent to moderators')
  },
} satisfies CommandHandlerConfig
