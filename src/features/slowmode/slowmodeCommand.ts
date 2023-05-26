import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  PermissionsBitField,
  TextChannel,
} from 'discord.js'

import { defineCommand } from '@/types/defineCommand'

export const slowmodeCommand = defineCommand({
  data: {
    name: 'slowmode',
    description: 'Set slowmode for all text channels in the server',
    defaultMemberPermissions:
      PermissionsBitField.Flags.ManageChannels |
      PermissionsBitField.Flags.ManageMessages,
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'duration',
        description: 'Duration of slowmode in seconds',
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 0,
        max_value: 21_600, // 6 hours (discord limit)
      },
    ],
  },
  ephemeral: true,
  execute: async (botContext, interaction) => {
    if (!interaction.guild || !interaction.isChatInputCommand()) return

    // Get only text channels in the server
    const channels = interaction.guild.channels.cache.filter(
      (channel) => channel.type === ChannelType.GuildText,
    )

    // Get duration from the interaction
    const duration = interaction.options.getInteger('duration')

    // Set slowmode for all channels
    await Promise.all(
      channels.map(async (channel) => {
        const textChannel = channel as TextChannel
        await textChannel.setRateLimitPerUser(duration ?? 0)
      }),
    )

    // Send confirmation message
    await interaction.editReply({
      content: `Slowmode set to ${duration} seconds for all text channels`,
    })
  },
})
