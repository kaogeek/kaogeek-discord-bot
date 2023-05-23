import { Events } from 'discord.js'

import { Environment } from '@/config'
import { defineEventHandler } from '@/types/defineEventHandler'

export default defineEventHandler({
  eventName: Events.ClientReady,
  once: true,
  execute: async (botContext) => {
    const { client, commands } = botContext

    console.log(`[ready] Now online as ${client.user?.tag}.`)
    const commands_data = [...commands.values()].map((command) => command.data)

    // Set guild commands
    try {
      const guild = client.guilds.cache.get(Environment.GUILD_ID)
      if (!guild) {
        throw new Error(`Guild ${Environment.GUILD_ID} not found`)
      }
      await guild.commands.set(commands_data)
      console.info(
        `[ready] ${commands.size} guild commands registered on ${guild.name}`,
      )
    } catch (error) {
      console.error('[ready] Unable to set guild commands:', error)
    }

    // Clear global commands
    try {
      const commands = await client.application?.commands.fetch()
      for (const command of commands?.values() || []) {
        await command.delete()
        console.info(`[ready] Deleted global command ${command.name}`)
      }
    } catch (error) {
      console.error('[ready] Unable to clear application commands:', error)
    }
  },
})
