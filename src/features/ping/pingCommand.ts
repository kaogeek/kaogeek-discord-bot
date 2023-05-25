import { CommandHandlerConfig } from '@/types/CommandHandlerConfig'

export const pingCommand: CommandHandlerConfig = {
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
          color: 65280,
        },
      ],
    })
  },
}
