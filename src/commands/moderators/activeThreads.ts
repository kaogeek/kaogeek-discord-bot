import {
  APIThreadChannel,
  ApplicationCommandType,
  PermissionsBitField,
  RESTGetAPIGuildThreadsResult,
  Routes,
} from 'discord.js'

import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'

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
    await interaction.editReply({
      content: `There are currently **${threads.length}** active threads in this server.`,
    })
  },
} satisfies CommandHandlerConfig
