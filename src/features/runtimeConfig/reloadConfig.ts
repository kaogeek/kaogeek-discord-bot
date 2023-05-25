import { PermissionsBitField, codeBlock } from 'discord.js'

import { CommandHandlerConfig } from '@/types/CommandHandlerConfig'

export default {
  data: {
    name: 'reload-config',
    description: 'Reload configuration',
    defaultMemberPermissions: PermissionsBitField.Flags.ManageGuild,
  },
  ephemeral: true,
  execute: async ({ runtimeConfiguration }, interaction) => {
    const data = await runtimeConfiguration.reload()
    await interaction.editReply({
      content:
        'Configuration has been reloaded.\n' +
        codeBlock('json', JSON.stringify(data, null, 2)),
    })
  },
} satisfies CommandHandlerConfig
