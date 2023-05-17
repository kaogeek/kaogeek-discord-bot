import { EventHandlerConfig } from '../types/event-handler-config.types.js'

export default {
  eventName: 'interactionCreate',
  once: false,
  execute: async (client, interaction) => {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName)
      if (!command) return
      let bypass = true
      await interaction
        .deferReply({ ephemeral: command.ephemeral })
        .catch(() => (bypass = false))
      if (!bypass) return
      try {
        console.log(
          `[Command] ${interaction.user.tag} (${interaction.user.id}) > ${interaction.commandName}`,
        )
        await command.execute(client, interaction)
      } catch (error) {
        console.error(error)
        await interaction.deleteReply()
      }
    }
  },
} satisfies EventHandlerConfig<'interactionCreate'>
