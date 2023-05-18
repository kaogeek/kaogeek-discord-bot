import {
  ApplicationCommandType,
  ButtonStyle,
  ChannelType,
  ComponentType,
  DiscordAPIError,
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

    // TODO: Confirmation banner
    await interaction.followUp({
      content: 'Are you sure you want to prune all messages from this user?',
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: ButtonStyle.Primary,
              label: 'Yes',
              customId: 'yes',
            },
            {
              type: ComponentType.Button,
              style: ButtonStyle.Danger,
              label: 'No',
              customId: 'no',
            },
          ],
        },
      ],
    })

    // Await button interaction for confirmation
    const buttonInteraction = await interaction.channel?.awaitMessageComponent({
      filter: (i) => i.customId === 'yes' || i.customId === 'no',
      time: 10000, // Adjust timeout as needed
    })

    if (buttonInteraction?.customId === 'no') {
      // Reply about the cancel action
      await interaction.editReply({
        content: `Prune message was canceled`,
        components: [],
      })
      return
    }

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
            await interaction.editReply({
              content: 'Successfully prune messages',
              components: [],
            })
          } catch (error) {
            // Reply about the error
            await interaction.editReply({
              content: `Error deleting messages: ${
                (error as DiscordAPIError).message
              }`,
              components: [],
            })
            console.error('Error deleting messages:', error)
          }
        }
      }
    }
  },
} satisfies CommandHandlerConfig
