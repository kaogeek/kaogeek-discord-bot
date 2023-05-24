import { codeBlock } from 'discord.js'

import { defineCommandHandler } from '@/types/defineCommandHandler'

export default defineCommandHandler({
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
