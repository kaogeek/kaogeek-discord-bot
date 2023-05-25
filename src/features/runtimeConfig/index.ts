import { definePlugin } from '@/types/definePlugin'

import { inspectConfig } from './inspectConfig'
import { reloadConfig } from './reloadConfig'

export default definePlugin({
  name: 'runtimeConfig',
  setup: (pluginContext) => {
    pluginContext.addCommand(inspectConfig)
    pluginContext.addCommand(reloadConfig)
  },
})
