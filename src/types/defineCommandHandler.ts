import { CommandHandlerConfig } from './CommandHandlerConfig'
import { Plugin } from './Plugin'
import { definePlugin } from './definePlugin'

export function defineCommandHandler(config: CommandHandlerConfig): Plugin {
  return definePlugin({
    name: `legacyCommandHandler[${config.data.name}]`,
    setup: (pluginContext) => {
      pluginContext.addCommand(config)
    },
  })
}
