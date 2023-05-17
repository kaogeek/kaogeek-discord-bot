import { CommandHandlerConfig } from '../types/command-handler-config.types'
import { EventHandlerConfig } from '../types/event-handler-config.types'

export const validateEventHandlerConfig = (
  config: unknown
): config is EventHandlerConfig => true // TODO: Validate config to be appropriate value

export const validateCommandHandlerConfig = (
  config: unknown
): config is CommandHandlerConfig => true // TODO: Validate config to be appropriate value
