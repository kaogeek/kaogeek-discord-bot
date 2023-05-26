import { definePlugin } from '@/types/definePlugin'

import { pruneMessagesCommand } from './pruneMessagesCommand'

export default definePlugin({
  name: 'messagePruner',
  setup: (pluginContext) => {
    pluginContext.addCommand(pruneMessagesCommand)
  },
})
