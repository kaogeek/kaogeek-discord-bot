import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  ComponentType,
  PermissionsBitField,
  TextChannel,
  TextInputStyle,
} from 'discord.js'

import { StickyMessage } from '@prisma/client'
import { randomUUID } from 'crypto'

import {
  STICKY_CACHE_PREFIX,
  STICKY_MODAL_TIMEOUT,
} from '../../features/stickyMessage/index.js'
import { prisma } from '../../prisma.js'
import { defineCommandHandler } from '../../types/defineCommandHandler.js'
import { getCache, removeCache, saveCache } from '../../utils/cache.js'

export default [
  defineCommandHandler({
    data: {
      name: 'stickao-set',
      description:
        'set sticky message in current channel (will reset every 5 message)',
      defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
      type: ApplicationCommandType.ChatInput,
    },
    ephemeral: false,
    disableAutoDeferReply: true,
    execute: async (botContext, interaction) => {
      if (!interaction.guild || !interaction.isChatInputCommand()) return
      const { client } = botContext

      // check is the text channel
      const channel = client.channels.cache.get(interaction.channelId)
      if (channel?.type !== ChannelType.GuildText) {
        interaction.reply({
          content: 'Sticky text can create only in text channel.',
        })
        return
      }

      //show input modal (message)
      try {
        await interaction.showModal({
          customId: randomUUID(),
          title: 'Stickao Message Input Form',
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  customId: 'message',
                  label: 'Message',
                  type: ComponentType.TextInput,
                  style: TextInputStyle.Paragraph,
                  required: true,
                },
              ],
            },
          ],
        })
      } catch (err) {
        console.error(`modal error: ${(err as Error).message}`)
      }

      // set timeout and handle reply to user when timeout
      const replyInteraction = await interaction.awaitModalSubmit({
        filter: (i) => i.user.id === interaction.user.id,
        time: STICKY_MODAL_TIMEOUT,
      })

      // TODO: handle modal timeout
      if (!replyInteraction) {
        interaction.reply({
          content:
            'You did not provide additional details for the sticky message. The operation has been canceled.',
        })
        return
      }

      await replyInteraction.deferReply()

      //get content from modal
      const message = replyInteraction.fields.getTextInputValue('message')

      // send message
      const sentMessage = await (channel as unknown as TextChannel).send({
        content: message,
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

        saveCache(
          `${STICKY_CACHE_PREFIX}-${interaction.channelId}`,
          stickyMessage,
        )

        // successfully create sticky message
        console.info(`Sticky message saved: ${message}`)
        replyInteraction.editReply({
          content: 'Successfully created sticky message.',
        })
      } catch (err) {
        console.error(
          `Error creating sticky message: ${(err as Error).message}`,
        )
        interaction.reply({
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
    },
    ephemeral: false,
    execute: async (_botContext, interaction) => {
      if (!interaction.guild || !interaction.isChatInputCommand()) return

      try {
        // Retrieve the sticky message with the specified order from the database
        const stickyMessage = getCache(
          `${STICKY_CACHE_PREFIX}-${interaction.channelId}`,
        ) as StickyMessage

        // If the sticky message exists, remove it from the database
        if (stickyMessage) {
          await prisma.stickyMessage.delete({
            where: {
              channelId: interaction.channelId,
            },
          })
          removeCache(`${STICKY_CACHE_PREFIX}-${interaction.channelId}`)
          console.info(`Sticky message removed: ${stickyMessage.message}`)
          interaction.reply({
            content: 'Successfully removed the sticky message.',
          })
        } else {
          interaction.reply({
            content: 'Not found message in this channel',
          })
        }
      } catch (err) {
        console.error(
          `Error removing sticky message: ${(err as Error).message}`,
        )
        interaction.reply({
          content: 'An error occurred while removing the sticky message.',
        })
      }
    },
  }),
]
