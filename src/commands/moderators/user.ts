import { ApplicationCommandType, time } from 'discord.js'

import { defineCommandHandler } from '@/types/defineCommandHandler'

export default defineCommandHandler({
  data: {
    name: 'Show user info',
    type: ApplicationCommandType.User,
  },
  ephemeral: true,
  execute: async (botContext, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return
    const member = interaction.guild.members.cache.get(interaction.targetId)
    if (!member) return
    await interaction.editReply({
      embeds: [
        {
          title: member.user.tag,
          description: `${member.user}`,
          fields: [
            {
              name: 'Joined',
              value: member.joinedAt ? time(member.joinedAt) : 'N/A',
              inline: true,
            },
            {
              name: 'Created',
              value: time(member.user.createdAt),
              inline: true,
            },
          ],
        },
      ],
    })
  },
})
