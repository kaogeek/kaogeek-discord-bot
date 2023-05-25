import { ClientEvents } from 'discord.js'

import { EventHandlerConfig } from './EventHandlerConfig'
import { Plugin } from './Plugin'
import { definePlugin } from './definePlugin'

export function defineEventHandler<K extends keyof ClientEvents>(
  config: EventHandlerConfig<K> & { displayName?: string },
): Plugin {
  return definePlugin({
    name: `LegacyEventHandlerPlugin[${config.displayName ?? config.eventName}]`,
    setup: (plugin) => {
      plugin.addEventHandler(config)
    },
  })
}
