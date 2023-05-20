import {
  APIThreadChannel,
  ApplicationCommandType,
  AttachmentBuilder,
  Channel,
  ComponentType,
  MessageActionRowComponentData,
  MessageComponentInteraction,
  PermissionsBitField,
  SelectMenuComponentOptionData,
  SnowflakeUtil,
} from 'discord.js'

import {
  getActiveThreads,
  getThreadStats,
} from '../../features/threadPruner/index.js'
import { BotContext } from '../../types/BotContext.js'
import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'
import { ActionSet } from '../../utils/ActionSet.js'
import { toLocalDate } from '../../utils/toLocalDate.js'

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
    const threads = await getActiveThreads(client, interaction.guild)
    const actionSet = new ActionSet()
    const stats = getThreadStats(threads)
    const options: SelectMenuComponentOptionData[] = [
      {
        label: 'Generate report',
        value: actionSet.register(
          'generate-report',
          async (selectInteraction) =>
            generateReport(botContext, selectInteraction, threads),
        ),
      },
      ...stats.pruningCriteria.map((item) => ({
        label: `${item.name} (${item.threadIds.length}) (unimplemented)`,
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
      })),
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

async function generateReport(
  botContext: BotContext,
  interaction: MessageComponentInteraction,
  threads: APIThreadChannel[],
) {
  const tsv = [
    [
      'ID',
      'Name',
      'Channel ID',
      'Channel Name',
      'Last Message',
      'Message Count',
    ],
    ...threads.map((thread) => {
      const channel = thread.parent_id
        ? botContext.client.channels.cache.get(thread.parent_id)
        : undefined
      return [
        thread.id,
        thread.name,
        thread.parent_id ?? '-',
        (channel && 'name' in channel && channel.name) ?? '-',
        thread.last_message_id
          ? toLocalDate(SnowflakeUtil.timestampFrom(thread.last_message_id))
          : '-',
        thread.message_count,
      ]
    }),
  ]
    .map((row) => row.join('\t'))
    .join('\n')
  await interaction.reply({
    content: 'Here is the report.',
    files: [new AttachmentBuilder(Buffer.from(tsv), { name: 'threads.tsv' })],
    ephemeral: true,
  })
}
