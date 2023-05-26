import { codeBlock } from 'discord.js'

import { defineCommand } from '@/types/defineCommand'

export const inspectConfigCommand = defineCommand({
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
})
