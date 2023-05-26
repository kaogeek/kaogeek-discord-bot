import { CommandConfig } from './CommandConfig'

/**
 * Defines a Discord application command.
 * This utility is useful when you want to define a command separately from the plugin (e.g. for refactoring old code).
 * However, in most new code, you should use `PluginContext.addCommand` directly instead.
 */
export function defineCommand(config: CommandConfig): CommandConfig {
  return config
}
