import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  PermissionsBitField,
  TextChannel,
} from 'discord.js'

import { defineCommandHandler } from '@/types/defineCommandHandler'

export default defineCommandHandler({
  data: {
    name: 'slowmode',
    description: 'Set slowmode for all text channels in the server',
    defaultMemberPermissions:
      PermissionsBitField.Flags.ManageChannels ||
      PermissionsBitField.Flags.ManageMessages,
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'duration',
        description: 'Duration of slowmode in seconds',
        type: ApplicationCommandOptionType.Integer,
        required: true,
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
