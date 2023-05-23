import { Events } from 'discord.js'

import { defineEventHandler } from '@/types/defineEventHandler'

export default defineEventHandler({
  eventName: Events.InteractionCreate,
  once: false,
  execute: async (botContext, interaction) => {
    if (interaction.isCommand()) {
      const commandName = interaction.commandName
      const { commands } = botContext
      const command = commands.get(commandName)
      if (!command) return
      try {
        if (!command.disableAutoDeferReply) {
          await interaction.deferReply({ ephemeral: command.ephemeral })
        }
      } catch (error) {
        console.error(`[Command: ${commandName}] Unable to defer reply:`, error)
        return
      }
      try {
        console.log(
          `[Command: ${commandName}] Invoked by ${interaction.user.tag} (${interaction.user.id})`,
        )
        await command.execute(botContext, interaction)
      } catch (error) {
        console.error(`[Command: ${commandName}] Command execute error:`, error)
        await interaction.deleteReply()
      }
    }
  },
})
