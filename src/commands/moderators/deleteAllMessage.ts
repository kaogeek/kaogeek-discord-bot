import {
  ApplicationCommandType,
  ButtonStyle,
  ChannelType,
  ComponentType,
  DiscordAPIError,
  PermissionsBitField,
} from 'discord.js'

import { defineCommandHandler } from '../../types/defineCommandHandler.js'

export default defineCommandHandler({
  data: {
    name: 'Prune messages',
    type: ApplicationCommandType.Message,
    defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
    dmPermission: false,
  },
  ephemeral: true,
  execute: async (botContext, interaction) => {
    if (!interaction.guild || !interaction.isContextMenuCommand()) return

    // Fetch reference message by target id
    const message = await interaction.channel?.messages.fetch(
      interaction.targetId,
    )

    // Confirmation banner
    await interaction.followUp({
      content: `Are you sure you want to prune all messages from **${message?.author.username}**?`,
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

    try {
      // Await button interaction for confirmation
      const buttonInteraction =
        await interaction.channel?.awaitMessageComponent({
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
    } catch (err) {
      await interaction.editReply({
        content: 'Confirmation not received within 10 seconds, cancelling',
        components: [],
      })
      return
    }

    // Delete message in all channel
    let numDeleted = 0
    const { client } = botContext
    for (const [channelId, channel] of client.channels.cache) {
      if (
        channel.type === ChannelType.GuildText || //for text channel
        channel.type === ChannelType.GuildVoice || //for openchat at voice channel
        channel.type === ChannelType.GuildStageVoice || //for openchat stage channel
        channel.type === ChannelType.PublicThread //for public thread and forum
      ) {
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
            numDeleted += userMessages.size
          } catch (error) {
            // Reply about the error
            //for error 400 : you can bulk delete messages that are under 14 days old.
            if ((error as DiscordAPIError).status === 400) {
              await interaction.editReply({
                content: `${(error as DiscordAPIError).message}`,
                components: [],
              })
              continue
            }
            await interaction.editReply({
              content: `Error deleting messages: ${
                (error as DiscordAPIError).message
              }`,
              components: [],
            })
            console.error('Error deleting messages:', error)
            if ((error as DiscordAPIError).status === 404) {
              return
            }
          }
        }
      }
    }
    // Tell the user that the messages were successfully pruned
    await interaction.editReply({
      content: `Successfully prune messages. Number of messages deleted: ${numDeleted}`,
      components: [],
    })
  },
})
