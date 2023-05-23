import {
  APIThreadChannel,
  ApplicationCommandType,
  Client,
  ComponentType,
  MessageActionRowComponentData,
  PermissionsBitField,
  RESTGetAPIGuildThreadsResult,
  Routes,
  SelectMenuComponentOptionData,
} from 'discord.js'

import { CommandHandlerConfig } from '@/types/CommandHandlerConfig'
import { ActionSet } from '@/utils/ActionSet'

export default {
  data: {
    name: 'active-threads',
    description: 'Get information and statistics about server threads',
    defaultMemberPermissions: PermissionsBitField.Flags.ManageMessages,
    type: ApplicationCommandType.ChatInput,
  },
  ephemeral: false,
  execute: async (botContext, interaction) => {
    if (!interaction.guild || !interaction.isChatInputCommand()) return
    const { client } = botContext
    const data = await getActiveThreads(client, interaction.guild)

    // Sort threads by last message (more recent first)
    const threads = [...(data.threads as APIThreadChannel[])].sort(
      (a, b) => +(b.last_message_id ?? 0) - +(a.last_message_id ?? 0),
    )

    const actionSet = new ActionSet()
    const options: SelectMenuComponentOptionData[] = [
      {
        label: 'Generate report (unimplemented)',
        value: actionSet.register(
          'generate-report',
          async (selectInteraction) => {
            // TODO: Implement
            await selectInteraction.reply({
              content: 'Unimplemented!',
              ephemeral: true,
            })
          },
        ),
      },
      {
        label: 'Prune old threads (unimplemented)',
        value: actionSet.register(
          'prune-old-threads',
          async (selectInteraction) => {
            // TODO: Implement
            await selectInteraction.reply({
              content: 'Unimplemented!',
              ephemeral: true,
            })
          },
        ),
      },
    ]
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
        options,
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
    await interaction.editReply({ components: [] })
    if (!action) {
      return
    }
    await action.registeredAction.handler(action.interaction)
  },
} satisfies CommandHandlerConfig

async function getActiveThreads(client: Client, guild: { id: string }) {
  return (await client.rest.get(
    Routes.guildActiveThreads(guild.id),
  )) as RESTGetAPIGuildThreadsResult
}
