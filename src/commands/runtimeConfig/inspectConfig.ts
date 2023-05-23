import { defineCommandHandler } from '@/types/defineCommandHandler.ts'

export default defineCommandHandler({
  data: {
    name: 'inspect-config',
    description: 'Display the current configuration',
  },
  ephemeral: true,
  execute: async ({ runtimeConfiguration }, interaction) => {
    await interaction.editReply({
      content: [
        'Current configuration:',
        '```json',
        JSON.stringify(runtimeConfiguration.data, null, 2),
        '```',
      ].join('\n'),
    })
  },
})
