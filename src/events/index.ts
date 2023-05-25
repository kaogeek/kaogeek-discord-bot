import { Plugin } from '@/types/Plugin'

import guildMemberAdd from './guildMemberAdd'
import guildMemberRemove from './guildMemberRemove'
import guildMemberUpdate from './guildMemberUpdate'
import interactionCreate from './interactionCreate'
import messageCreate from './messageCreate'
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
  messageCreate,
  preventEmojiSpam,
  stickyMessageHandler,
  stickyMessageCreate,
  stickyMessageRemove,
  ready,
] satisfies Plugin[]
