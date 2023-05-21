import { defineCommandHandler } from '../../types/defineCommandHandler.js'

export default defineCommandHandler({
  data: {
    name: 'show-config',
    description: 'Show current configuration',
  },
  ephemeral: true,
  execute: async ({ runtimeConfiguration }, interaction) => {
    await interaction.editReply({
      content: [
        'Current configuration:',
        '',
        '```json',
        JSON.stringify(runtimeConfiguration.data, null, 2),
        '```',
      ].join('\n'),
    })
  },
})
