import {
  APIThreadChannel,
  ApplicationCommandType,
  ComponentType,
  MessageActionRowComponentData,
  PermissionsBitField,
  RESTGetAPIGuildThreadsResult,
  Routes,
} from 'discord.js'

import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'
import { ActionSet } from '../../utils/ActionSet.js'

export default {
  data: {
    name: 'active-threads',
    description: 'Get information and statistics about server threads',
    defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
    type: ApplicationCommandType.ChatInput,
  },
  ephemeral: false,
  execute: async (client, interaction) => {
    if (!interaction.guild || !interaction.isChatInputCommand()) return
    const data = (await client.rest.get(
      Routes.guildActiveThreads(interaction.guild.id),
    )) as RESTGetAPIGuildThreadsResult
    const threads = (data.threads as APIThreadChannel[])
      .slice()
      .sort((a, b) => +(a.last_message_id || 0) - +(b.last_message_id || 0))
    const actionSet = new ActionSet()
    const components: MessageActionRowComponentData[] = [
      {
        type: ComponentType.StringSelect,
        customId: actionSet.register('select', async (selectInteraction) => {
          if (!selectInteraction.isStringSelectMenu()) return
          const customId = selectInteraction.values[0]
          const resolved = actionSet.resolve({ customId })
          if (!resolved) return
          await resolved.handler(selectInteraction)
        }),
        placeholder: 'Select an action',
        options: [
          {
            label: 'Generate report (unimplemented)',
            value: actionSet.register(
              'generate-report',
              async (selectInteraction) => {
                await selectInteraction.reply({
                  content: 'Unimplemented!',
                  ephemeral: true,
                })
              },
            ),
          },
          {
            label: 'Prune old threads (unimplemented)',
            value: actionSet.register('prune', async (selectInteraction) => {
              await selectInteraction.reply({
                content: 'Unimplemented!',
                ephemeral: true,
              })
            }),
          },
        ],
      },
    ]
    await interaction.editReply({
      content: `There are currently **${threads.length}** active threads in this server.`,
      components: [
        {
          type: ComponentType.ActionRow,
          components,
        },
      ],
    })
    const action = await actionSet.awaitInChannel(
      interaction.channel,
      60e3,
      interaction.user,
    )
    await interaction.editReply({ components: [] }).catch(console.error)
    if (!action) return
    await action.registeredAction.handler(action.interaction)
  },
} satisfies CommandHandlerConfig
