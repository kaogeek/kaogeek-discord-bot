import { definePlugin } from '@/types/definePlugin'

import { activeThreadsCommand } from './activeThreadsCommand'

export default definePlugin({
  name: 'threadPruner',
  setup: (pluginContext) => {
    pluginContext.addCommand(activeThreadsCommand)
  },
})
