import { ApplicationCommandType, PermissionsBitField } from 'discord.js'

import { inspectProfile } from '../../features/profileInspector/index.js'
import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'

export default {
  data: {
    name: 'Inspect profile',
    type: ApplicationCommandType.User,
    defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
    dmPermission: false,
  },
  ephemeral: true,
  execute: async (client, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return

    const userId = interaction.targetId
    const member = interaction.guild.members.cache.get(userId)
    if (!member) return

    await inspectProfile(client, interaction, member)
  },
} satisfies CommandHandlerConfig
