import { AnyEventHandlerConfig } from '../types/EventHandlerConfig.js'

import interactionCreate from './interactionCreate.js'
import preventEmojiSpam from './preventEmojiSpam.js'
import ready from './ready.js'

export default [
  interactionCreate,
  preventEmojiSpam,
  ready,
] satisfies AnyEventHandlerConfig[]
