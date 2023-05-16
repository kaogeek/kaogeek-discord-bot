import { CommandHandlerConfig } from '../types/command-handler-config.types.js'
import { EventHandlerConfig } from '../types/event-handler-config.types.js'

export const validateEventHandlerConfig = (
  config: unknown
): config is EventHandlerConfig => true // TODO: Validate config to be appropriate value

export const validateCommandHandlerConfig = (
  config: unknown
): config is CommandHandlerConfig => true // TODO: Validate config to be appropriate value
