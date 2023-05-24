import {
  APIThreadChannel,
  ApplicationCommandType,
  AttachmentBuilder,
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
} from '@/features/threadPruner/index.js'
import { BotContext } from '@/types/BotContext.js'
import { CommandHandlerConfig } from '@/types/CommandHandlerConfig.js'
import { ActionSet } from '@/utils/ActionSet.js'
import { generateTsv } from '@/utils/generateTsv.js'
import { toLocalDate } from '@/utils/toLocalDate.js'

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
        label: `${item.name} (${item.threadIds.length})`,
        value: actionSet.register(
          'prune-old-threads',
          async (selectInteraction) =>
            pruneThreads(botContext, selectInteraction, item.threadIds),
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
  const tsv = generateTsv([
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
  ])
  await interaction.reply({
    content: 'Here is the report.',
    files: [new AttachmentBuilder(Buffer.from(tsv), { name: 'threads.tsv' })],
    ephemeral: true,
  })
}

async function pruneThreads(
  botContext: BotContext,
  selectInteraction: MessageComponentInteraction,
  threadIds: string[],
) {
  await selectInteraction.reply({
    content: `Archiving ${threadIds.length} threads...`,
    ephemeral: true,
  })

  try {
    let lastUpdate = 0
    let count = 0
    for (const threadId of threadIds) {
      const thread = botContext.client.channels.cache.get(threadId)
      if (!thread || !('setArchived' in thread)) continue
      await thread.setArchived(true)
      count++
      if (Date.now() - lastUpdate > 5e3) {
        await selectInteraction.editReply({
          content: `Archived ${count}/${threadIds.length} threads...`,
        })
        lastUpdate = Date.now()
      }
    }

    await selectInteraction.editReply({
      content: `Finished archiving ${threadIds.length} threads.`,
    })
  } catch (error) {
    await selectInteraction.editReply({
      content: `Error archiving threads: ${error}`,
    })
  }
}
