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
    name: 'Prune messages',
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
    for (const [channelId, channel] of client.channels.cache) {
      if (channel.type === ChannelType.GuildText) {
        const message = await channel.messages.fetch(interaction.targetId)
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
            // Tell the user that the messages were successfully pruned
            await interaction.editReply('Successfully prune messages')
          } catch (error) {
            // Reply about the error
            await interaction.editReply(
              `Error deleting messages: ${(error as DiscordAPIError).message}`,
            )
            console.error('Error deleting messages:', error)
          }
        }
      }
    }
  },
} satisfies CommandHandlerConfig
