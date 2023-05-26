import { definePlugin } from '@/types/definePlugin'

import { userInfoCommand } from './userInfoCommand'

export default definePlugin({
  name: 'userInfo',
  setup: (pluginContext) => {
    pluginContext.addCommand(userInfoCommand)
  },
})
