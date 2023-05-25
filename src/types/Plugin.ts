import { PluginContext } from './PluginContext'

export interface Plugin {
  name: string
  setup(pluginContext: PluginContext): void
}
