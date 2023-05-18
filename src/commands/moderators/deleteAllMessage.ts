import {
  ApplicationCommandType,
  ChannelType,
  DiscordAPIError,
  GuildMember,
  PermissionsBitField,
} from 'discord.js'

import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'

export default {
  data: {
    name: 'Delete All',
    type: ApplicationCommandType.Message,
  },
  ephemeral: true,
  execute: async (client, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return

    // Get the member who initiated the interaction
    const member = interaction.member as GuildMember

    // Check user permission
    if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      console.warn(`[WARN] ${member.displayName} try to delete all message`)
      await interaction.editReply(
        'Invalid permission, this command available for ONLY Moderator',
      )
      return
    }

    // Delete message in all channel
    client.channels.cache.forEach(async (channel) => {
      if (channel.type === ChannelType.GuildText) {
        const message = await interaction.channel?.messages.fetch(
          interaction.targetId,
        )

        const messages = await channel.messages.fetch()
        const userMessages = messages.filter(
          (msg) => msg.author.id === message?.author.id,
        )

        if (userMessages.size > 0) {
          try {
            await channel.bulkDelete(userMessages)
            console.info(
              `Deleted ${userMessages.size} messages from ${interaction.targetId} in channel ${channel.name}.`,
            )
            // Tell the user that the successfully delete all message
            await interaction.editReply('Successfully delete all message')
          } catch (error) {
            // Tell the user that the successfully delete all message
            await interaction.editReply(
              `Error deleting messages: ${(error as DiscordAPIError).message}`,
            )
            console.error('Error deleting messages:', error)
          }
        }
      }
    })
  },
} satisfies CommandHandlerConfig
