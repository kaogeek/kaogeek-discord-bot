import { Events } from 'discord.js'

import { Environment } from '../config.js'
import { EventHandlerConfig } from '../types/EventHandlerConfig.js'

export default {
  eventName: Events.ClientReady,
  once: true,
  execute: async (client) => {
    console.log(`[ready] Now online as ${client.user?.tag}.`)
    const commands_data = [...client.commands.values()].map(
      (command) => command.data,
    )

    // Set guild commands
    try {
      const guild = client.guilds.cache.get(Environment.GUILD_ID)
      if (!guild) {
        throw new Error(`Guild ${Environment.GUILD_ID} not found`)
      }
      await guild.commands.set(commands_data)
      console.info(`[ready] Guild commands registered on ${guild.name}`)
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
} satisfies EventHandlerConfig<Events.ClientReady>
