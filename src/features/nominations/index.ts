import { definePlugin } from '@/types/definePlugin'

import { nominateCommand } from './nominateCommand'

export default definePlugin({
  name: 'nominations',
  setup: (pluginContext) => {
    pluginContext.addCommand(nominateCommand)
  },
})
