import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  PermissionsBitField,
} from 'discord.js'

import { inspectProfile } from '../../features/profileInspector/index.js'
import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'

export default [
  {
    data: {
      name: 'Inspect profile',
      type: ApplicationCommandType.User,
      defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
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
  },
  {
    data: {
      name: 'Inspect author profile',
      type: ApplicationCommandType.Message,
      defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
      dmPermission: false,
    },
    ephemeral: true,
    execute: async (client, interaction) => {
      if (!interaction.guild || !interaction.isContextMenuCommand()) return

      const messageId = interaction.targetId
      const message = await interaction.channel?.messages.fetch(messageId)
      if (!message) return

      const userId = message.author.id
      const member = interaction.guild.members.cache.get(userId)
      if (!member) return

      await inspectProfile(client, interaction, member, message)
    },
  },
  {
    data: {
      name: 'inspect',
      description: 'Inspect a user profile',
      defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'user',
          description: 'The user to inspect',
          type: ApplicationCommandOptionType.User,
        },
      ],
    },
    ephemeral: true,
    execute: async (client, interaction) => {
      if (!interaction.guild || !interaction.isChatInputCommand()) return

      const userId = interaction.options.getUser('user')?.id
      if (!userId) return
      const member = interaction.guild.members.cache.get(userId)
      if (!member) return

      await inspectProfile(client, interaction, member)
    },
  },
] satisfies CommandHandlerConfig[]
