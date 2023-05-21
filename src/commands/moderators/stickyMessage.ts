import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  PermissionsBitField,
  TextChannel,
} from 'discord.js'

import { prisma } from '../../prisma.js'
import { defineCommandHandler } from '../../types/defineCommandHandler.js'
import { saveCache } from '../../utils/cache.js'

export default [
  defineCommandHandler({
    data: {
      name: 'stickao-set',
      description:
        'set sticky message in current channel (will reset every 5 message)',
      defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'message',
          description:
            'The message that you want to sticky in the bottom of channel (required)',
          type: ApplicationCommandOptionType.String,
        },
        // {
        //   name: 'embed',
        //   description: 'is embed',
        //   type: ApplicationCommandOptionType.Boolean,
        // },
      ],
    },
    ephemeral: false,
    execute: async (botContext, interaction) => {
      if (!interaction.guild || !interaction.isChatInputCommand()) return
      const { client } = botContext

      // Validate that the message input is not null
      if (!interaction.options.getString('message')) {
        interaction.editReply({
          content: 'Please provide a valid message for the sticky message.',
        })
        return
      }

      const message = interaction.options.getString('message') as string

      // send message
      const channel = client.channels.cache.get(interaction.channelId)
      if (!(channel instanceof TextChannel)) return

      const sentMessage = await channel.send({
        content: message,
        // embeds: [{}],
      })

      // save message
      try {
        const stickyMessage = await prisma.stickyMessage.upsert({
          create: {
            messageId: sentMessage.id,
            channelId: interaction.channelId,
            message: message,
          },
          update: {
            messageId: sentMessage.id,
            message: message,
          },
          where: {
            channelId: interaction.channelId,
          },
        })

        saveCache(interaction.channelId, stickyMessage)

        // successfully create sticky message
        console.info(`Sticky message saved: ${message}`)
        interaction.editReply({
          content: 'Successfully created sticky message.',
        })
      } catch (err) {
        console.error(
          `Error creating sticky message: ${(err as Error).message}`,
        )
        interaction.editReply({
          content: 'An error occurred while creating the sticky message.',
        })
      }
    },
  }),
  defineCommandHandler({
    data: {
      name: 'stickao-remove',
      description: 'Remove the sticky message',
      defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
      type: ApplicationCommandType.ChatInput,
      options: [
        // {
        //   name: 'order',
        //   description:
        //     'The order of message that want to remove start from 1 (required)',
        //   type: ApplicationCommandOptionType.Integer,
        // },
      ],
    },
    ephemeral: false,
    execute: async (botContext, interaction) => {
      if (!interaction.guild || !interaction.isChatInputCommand()) return

      // Validate that the message input is not null
      if (!interaction.options.getInteger('order')) {
        interaction.editReply({
          content: 'Please provide a order of message that want to remove',
        })
        return
      }

      // Retrieve the sticky message with the specified order from the database
      const stickyMessage = await prisma.stickyMessage.findUnique({
        where: {
          channelId: interaction.channelId,
        },
      })

      // If the sticky message exists, remove it from the database
      if (stickyMessage) {
        try {
          await prisma.stickyMessage.delete({
            where: {
              channelId: interaction.channelId,
            },
          })
          console.info(`Sticky message removed: ${stickyMessage.message}`)
          interaction.editReply({
            content: 'Successfully removed the sticky message.',
          })
        } catch (err) {
          console.error(
            `Error removing sticky message: ${(err as Error).message}`,
          )
          interaction.editReply({
            content: 'An error occurred while removing the sticky message.',
          })
        }
      } else {
        interaction.editReply({
          content: 'Not found message in this channel',
        })
      }
    },
  }),
]
