import { definePlugin } from '@/types/definePlugin'

import { inspectConfigCommand } from './inspectConfigCommand'
import { reloadConfigCommand } from './reloadConfigCommand'

export default definePlugin({
  name: 'runtimeConfig',
  setup: (pluginContext) => {
    pluginContext.addCommand(inspectConfigCommand)
    pluginContext.addCommand(reloadConfigCommand)
  },
})
