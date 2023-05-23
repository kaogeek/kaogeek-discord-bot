import { AnyEventHandlerConfig } from '@/types/EventHandlerConfig.ts'

import guildMemberAdd from './guildMemberAdd.ts'
import guildMemberRemove from './guildMemberRemove.ts'
import guildMemberUpdate from './guildMemberUpdate.ts'
import interactionCreate from './interactionCreate.ts'
import preventEmojiSpam from './preventEmojiSpam.ts'
import ready from './ready.ts'

export default [
  guildMemberAdd,
  guildMemberRemove,
  guildMemberUpdate,
  interactionCreate,
  preventEmojiSpam,
  ready,
] satisfies AnyEventHandlerConfig[]
