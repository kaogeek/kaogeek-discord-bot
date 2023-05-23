import {
  ApplicationCommandType,
  ButtonStyle,
  ChannelType,
  ComponentType,
  DiscordAPIError,
  GuildTextBasedChannelTypes,
  PermissionsBitField,
  TextChannel,
} from 'discord.js'

import { defineCommandHandler } from '@/types/defineCommandHandler'
import { isInArray } from '@/utils/typeGuards'

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
          filter: (index) =>
            index.customId === 'yes' || index.customId === 'no',
          time: 10_000, // Adjust timeout as needed
        })
      if (buttonInteraction?.customId === 'no') {
        // Reply about the cancel action
        await interaction.editReply({
          content: `Prune message was canceled`,
          components: [],
        })
        return
      }
    } catch {
      await interaction.editReply({
        content: 'Confirmation not received within 10 seconds, cancelling',
        components: [],
      })
      return
    }

    //Discord expects bot to acknowledge the interaction within 3 seconds so reply something first
    await interaction.editReply({
      content: 'Processing... Please wait a moment.',
      components: [],
    })

    // Delete message in all channel
    let numberDeleted = 0
    const { client } = botContext

    const selectedChannel: GuildTextBasedChannelTypes[] = [
      ChannelType.GuildText,
      ChannelType.GuildVoice,
      ChannelType.GuildStageVoice,
      ChannelType.PublicThread,
    ]

    for (const [channelId, channel] of client.channels.cache) {
      // Check if the channel type is in the supported text channel array
      if (isInArray(channel.type, selectedChannel)) {
        //supportedTextChannel only contains TextChannel,we can cast channel to TextChannel without any issues.
        const messages = await (channel as TextChannel).messages.fetch()
        let userMessages = messages.filter(
          (message_) => message_.author.id === message?.author.id,
        )
        //Filter messages within 2 weeks and delete it all
        const duration =
          Date.now() - (14 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000) // reduce by 1 hour
        userMessages = userMessages.filter(
          (message_) => message_.createdTimestamp > duration,
        )

        if (userMessages.size > 0) {
          try {
            await (channel as TextChannel).bulkDelete(userMessages)
            console.info(
              `Deleted ${userMessages.size} messages from ${
                interaction.targetId
              } in channel ${(channel as TextChannel).name} (${channelId}).`,
            )
            numberDeleted += userMessages.size
          } catch (error) {
            console.error('Error deleting messages:', error)
            if (error instanceof DiscordAPIError) {
              // Reply about the error
              //for error 400 : cant occur because the time period has been set for how many days to delete
              await interaction.editReply({
                content: `Error deleting messages: ${error.message}`,
                components: [],
              })
              if (error.status === 404) {
                return
              }
            }
          }
        }
      }
    }
    // Tell the user that the messages were successfully pruned
    console.info(`Successfully pruned ${numberDeleted} messages.`)
    await interaction.editReply({
      content: `Successfully prune messages. Number of messages deleted: ${numberDeleted}`,
      components: [],
    })
  },
})
