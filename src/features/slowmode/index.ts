import { definePlugin } from '@/types/definePlugin'

import { slowmodeCommand } from './slowmode'

export default definePlugin({
  name: 'slowmode',
  setup: (pluginContext) => {
    pluginContext.addCommand(slowmodeCommand)
  },
})
