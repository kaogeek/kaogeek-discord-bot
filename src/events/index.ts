import { Plugin } from '@/types/Plugin'

import guildMemberAdd from './guildMemberAdd'
import guildMemberRemove from './guildMemberRemove'
import guildMemberUpdate from './guildMemberUpdate'

export default [
  guildMemberAdd,
  guildMemberRemove,
  guildMemberUpdate,
] satisfies Plugin[]
