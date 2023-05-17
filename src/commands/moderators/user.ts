import { ApplicationCommandType } from 'discord.js'

import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'

export default {
  data: {
    name: 'user',
    type: ApplicationCommandType.User,
  },
  ephemeral: true,
  execute: async (client, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return
    const member = interaction.guild.members.cache.get(interaction.targetId)
    if (!member) return
    await interaction.editReply(
      `**${
        member.user.tag
      }**\nJoined: ${member.joinedAt?.toLocaleString()}\nCreated: ${member.user.createdAt.toLocaleString()}`,
    )
  },
} satisfies CommandHandlerConfig
