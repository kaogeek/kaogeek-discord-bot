import { Plugin } from '@/types/Plugin'

import guildMemberAdd from './guildMemberAdd'
import guildMemberRemove from './guildMemberRemove'
import guildMemberUpdate from './guildMemberUpdate'
import interactionCreate from './interactionCreate'
import ready from './ready'

export default [
  guildMemberAdd,
  guildMemberRemove,
  guildMemberUpdate,
  interactionCreate,
  ready,
] satisfies Plugin[]
