import { definePlugin } from '@/types/definePlugin'

import { reportToModeratorMessageCommand } from './reportToModeratorMessageCommand'

export default definePlugin({
  name: 'messageReporter',
  setup: (pluginContext) => {
    pluginContext.addCommand(reportToModeratorMessageCommand)
  },
})
