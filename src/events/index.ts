import { AnyEventHandlerConfig } from '@/types/EventHandlerConfig'

import guildMemberAdd from './guildMemberAdd'
import guildMemberRemove from './guildMemberRemove'
import guildMemberUpdate from './guildMemberUpdate'
import interactionCreate from './interactionCreate'
import preventEmojiSpam from './preventEmojiSpam'
import ready from './ready'
import stickyMessageHandler from './stickyMessageHandler'
import stickyMessageRemove from './stickyMessageRemove'
import stickyMessageCreate from './stickyMessageSet'

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
