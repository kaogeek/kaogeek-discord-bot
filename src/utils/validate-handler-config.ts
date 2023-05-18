import { CommandHandlerConfig } from '../types/CommandHandlerConfig.js'
import { EventHandlerConfig } from '../types/EventHandlerConfig.js'

// Validate config to be appropriate value
export const validateEventHandlerConfig = (
  config: unknown,
): config is EventHandlerConfig => {
  if (typeof config !== 'object' || config === null) {
    throw new TypeError('Config must be an object')
  }
  if (!('eventName' in config) || typeof config.eventName !== 'string')
    throw new TypeError('Config must have eventName property of type string')

  // once is optional
  if ('once' in config && typeof config.once !== 'boolean')
    throw new TypeError('once must be of type boolean if it exists in config')

  if (!('execute' in config) || typeof config.execute !== 'function')
    throw new TypeError('Config must have execute property of type function')

  return true
}

// Validate config to be appropriate value
export const validateCommandHandlerConfig = (
  config: unknown,
): config is CommandHandlerConfig => {
  if (typeof config !== 'object' || config === null) {
    throw new TypeError('Config must be an object')
  }

  if (!('data' in config) || typeof config.data !== 'object') {
    throw new TypeError('Config must have data property of type object')
  }

  // ephemeral is optional
  if ('ephemeral' in config && typeof config.ephemeral !== 'boolean')
    throw new TypeError('once must be of type boolean if it exists in config')

  if (!('execute' in config) || typeof config.execute !== 'function')
    throw new TypeError('Config must have execute property of type function')

  return true
}
