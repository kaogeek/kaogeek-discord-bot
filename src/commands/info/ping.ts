import { defineCommandHandler } from '@/types/defineCommandHandler'

export default defineCommandHandler({
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
