import { defineCommand } from '@/types/defineCommand'

export const pingCommand = defineCommand({
  data: {
    name: 'ping',
    description: 'Ping!',
  },
  ephemeral: true,
  execute: async ({ client }, interaction) => {
    await interaction.editReply({
      embeds: [
        { description: `ความหน่วง! ${client.ws.ping}ms`, color: 0x00_ff_00 },
      ],
    })
  },
})
