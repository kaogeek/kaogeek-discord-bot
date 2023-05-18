import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'

export default {
  data: {
    name: 'ping',
    description: 'Ping!',
  },
  ephemeral: true,
  execute: async (client, interaction) => {
    await interaction.editReply({
      embeds: [
        { description: `ความหน่วง! ${client.ws.ping}ms`, color: 0x00ff00 },
      ],
    })
  },
} satisfies CommandHandlerConfig
