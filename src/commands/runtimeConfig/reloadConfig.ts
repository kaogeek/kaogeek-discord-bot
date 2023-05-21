import { defineCommandHandler } from '../../types/defineCommandHandler.js'

export default defineCommandHandler({
  data: {
    name: 'reload-config',
    description: 'Reload configuration',
  },
  ephemeral: true,
  execute: async ({ runtimeConfiguration }, interaction) => {
    const data = await runtimeConfiguration.reload()
    await interaction.editReply({
      content: [
        'Configuration has been reloaded.',
        '',
        '```json',
        JSON.stringify(data, null, 2),
        '```',
      ].join('\n'),
    })
  },
})
