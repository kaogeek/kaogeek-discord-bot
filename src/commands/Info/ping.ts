import { CommandHandlerConfig } from '../../types/command-handler-config.types.js'

export default {
  data: {
    name: 'ping',
    description: 'Ping!',
  },
  execute: async (client, interaction) => {
    await interaction.editReply({
      embeds: [
        { description: `ความหน่วง! ${client.ws.ping}ms`, color: 0x00ff00 },
      ],
    })
  },
} satisfies CommandHandlerConfig
