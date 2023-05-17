import { CommandHandlerConfig } from '../../types/command-handler-config.types.js'

export default {
  data: {
    name: 'user',
    // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
    type: 2
  },
  ephemeral: true,
  execute: async (client, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return
    const member = interaction.guild.members.cache.get(interaction.targetId)
    if (!member) return
    await interaction.editReply(
      `**${
        member.user.tag
      }**\nJoined: ${member.joinedAt?.toLocaleString()}\nCreated: ${member.user.createdAt.toLocaleString()}`
    )
  },
} satisfies CommandHandlerConfig
