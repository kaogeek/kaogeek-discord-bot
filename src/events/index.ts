import { AnyEventHandlerConfig } from '../types/EventHandlerConfig.js'

import guildMemberAdd from './guildMemberAdd.js'
import guildMemberRemove from './guildMemberRemove.js'
import guildMemberUpdate from './guildMemberUpdate.js'
import interactionCreate from './interactionCreate.js'
import preventEmojiSpam from './preventEmojiSpam.js'
import ready from './ready.js'
import stickyMessage from './stickyMessage.js'

export default [
  guildMemberAdd,
  guildMemberRemove,
  guildMemberUpdate,
  interactionCreate,
  preventEmojiSpam,
  stickyMessage,
  ready,
] satisfies AnyEventHandlerConfig[]
