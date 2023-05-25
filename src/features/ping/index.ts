import { definePlugin } from '@/types/definePlugin'

export default definePlugin({
  name: 'ping',
  setup: (pluginContext) => {
    pluginContext.addCommand({
      data: {
        name: 'ping',
        description: 'Ping!',
      },
      ephemeral: true,
      execute: async ({ client }, interaction) => {
        await interaction.editReply({
          embeds: [
            {
              description: `ความหน่วง! ${client.ws.ping}ms`,
              color: 0x00_ff_00,
            },
          ],
        })
      },
    })
  },
})
