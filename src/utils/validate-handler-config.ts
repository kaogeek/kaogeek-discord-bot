import { CommandHandlerConfig } from '../types/CommandHandlerConfig.js'
import { EventHandlerConfig } from '../types/EventHandlerConfig.js'

export const validateEventHandlerConfig = (
  config: unknown,
): config is EventHandlerConfig => true // TODO: Validate config to be appropriate value

export const validateCommandHandlerConfig = (
  config: unknown,
): config is CommandHandlerConfig => true // TODO: Validate config to be appropriate value
