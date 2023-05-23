import { ApplicationCommandType } from 'discord.js'

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
    const joinedAtUnixSecond = Math.round(
      (member.joinedAt?.getTime() ?? 0) / 1000,
    )
    const createdAtUnixSecond = Math.round(
      member.user.createdAt.getTime() / 1000,
    )
    await interaction.editReply({
      embeds: [
        {
          title: member.user.tag,
          description: `${member.user}`,
          fields: [
            {
              name: 'Joined',
              value: `<t:${joinedAtUnixSecond}>`,
              inline: true,
            },
            {
              name: 'Created',
              value: `<t:${createdAtUnixSecond}>`,
              inline: true,
            },
          ],
        },
      ],
    })
  },
})
