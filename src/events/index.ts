import { AnyEventHandlerConfig } from '@/types/EventHandlerConfig'

import guildMemberAdd from './guildMemberAdd.js'
import guildMemberRemove from './guildMemberRemove.js'
import guildMemberUpdate from './guildMemberUpdate.js'
import interactionCreate from './interactionCreate.js'
import preventEmojiSpam from './preventEmojiSpam.js'
import ready from './ready.js'
import stickyMessageHandler from './stickyMessageHandler.js'
import stickyMessageRemove from './stickyMessageRemove.js'
import stickyMessageCreate from './stickyMessageSet.js'

export default [
  guildMemberAdd,
  guildMemberRemove,
  guildMemberUpdate,
  interactionCreate,
  preventEmojiSpam,
  stickyMessageHandler,
  stickyMessageCreate,
  stickyMessageRemove,
  ready,
] satisfies AnyEventHandlerConfig[]
