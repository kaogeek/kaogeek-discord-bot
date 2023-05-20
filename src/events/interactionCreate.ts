import { Events } from 'discord.js'

import { defineEventHandler } from '../types/defineEventHandler.js'

export default defineEventHandler({
  eventName: Events.InteractionCreate,
  once: false,
  execute: async (botContext, interaction) => {
    if (interaction.isCommand()) {
      const commandName = interaction.commandName
      const { commands } = botContext
      const command = commands.get(commandName)
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
        await command.execute(botContext, interaction)
      } catch (error) {
        console.error(error)
        await interaction.deleteReply()
      }
    }
  },
})
