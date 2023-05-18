import {
  ApplicationCommandType,
  ChannelType,
  DiscordAPIError,
  InteractionType,
  PermissionsBitField,
} from 'discord.js'

import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'

export default {
  data: {
    name: 'Prune messages',
    type: ApplicationCommandType.Message,
    defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
    dmPermission: false,
  },
  ephemeral: true,
  execute: async (client, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return

    // TODO: confirmation banner

    // Delete message in all channel
    const message = await interaction.channel?.messages.fetch(
      interaction.targetId,
    )

    for (const [channelId, channel] of client.channels.cache) {
      if (channel.type === ChannelType.GuildText) {
        const messages = await channel.messages.fetch()
        const userMessages = messages.filter(
          (msg) => msg.author.id === message?.author.id,
        )

        if (userMessages.size > 0) {
          try {
            await channel.bulkDelete(userMessages)
            console.info(
              `Deleted ${userMessages.size} messages from ${interaction.targetId} in channel ${channel.name} (${channelId}).`,
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
