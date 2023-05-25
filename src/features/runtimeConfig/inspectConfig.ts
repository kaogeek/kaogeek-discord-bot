import { codeBlock } from 'discord.js'

import { CommandHandlerConfig } from '@/types/CommandHandlerConfig'

export const inspectConfig: CommandHandlerConfig = {
  data: {
    name: 'inspect-config',
    description: 'Display the current configuration',
  },
  ephemeral: true,
  execute: async ({ runtimeConfiguration }, interaction) => {
    await interaction.editReply({
      content:
        'Current configuration:\n' +
        codeBlock('json', JSON.stringify(runtimeConfiguration.data, null, 2)),
    })
  },
}
