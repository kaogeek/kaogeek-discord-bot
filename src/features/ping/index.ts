import { definePlugin } from '@/types/definePlugin'

import { pingCommand } from './pingCommand'

export default definePlugin({
  name: 'ping',
  setup: (pluginContext) => {
    pluginContext.addCommand(pingCommand)
  },
})
