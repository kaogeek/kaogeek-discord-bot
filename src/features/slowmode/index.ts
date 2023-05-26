import { definePlugin } from '@/types/definePlugin'

import { slowmodeCommand } from './slowmodeCommand'

export default definePlugin({
  name: 'slowmode',
  setup: (pluginContext) => {
    pluginContext.addCommand(slowmodeCommand)
  },
})
