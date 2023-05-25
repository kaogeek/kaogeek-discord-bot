import { ClientEvents } from 'discord.js'

import { EventHandlerConfig } from './EventHandlerConfig'
import { Plugin } from './Plugin'
import { definePlugin } from './definePlugin'

export function defineEventHandler<K extends keyof ClientEvents>(
  config: EventHandlerConfig<K> & { displayName?: string },
): Plugin & { execute: EventHandlerConfig<K>['execute'] } {
  return Object.assign(
    definePlugin({
      name: `LegacyEventHandlerPlugin[${
        config.displayName ?? config.eventName
      }]`,
      setup: (plugin) => {
        plugin.addEventHandler(config)
      },
    }),

    // XXX: The `execute` function is not part of the plugin definition,
    // but it is exposed here because some unit tests need to call it.
    // Unit tests should not rely on implementation details like this,
    // because they are hard to refactor.
    { execute: config.execute },
  )
}
