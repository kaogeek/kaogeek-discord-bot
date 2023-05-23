import { AnyEventHandlerConfig } from '@/types/EventHandlerConfig'

import guildMemberAdd from './guildMemberAdd'
import guildMemberRemove from './guildMemberRemove'
import guildMemberUpdate from './guildMemberUpdate'
import interactionCreate from './interactionCreate'
import preventEmojiSpam from './preventEmojiSpam'
import ready from './ready'

export default [
  guildMemberAdd,
  guildMemberRemove,
  guildMemberUpdate,
  interactionCreate,
  preventEmojiSpam,
  ready,
] satisfies AnyEventHandlerConfig[]
