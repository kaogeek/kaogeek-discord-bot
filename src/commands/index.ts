import { Plugin } from '@/types/Plugin'

import deleteAllMessage from './moderators/deleteAllMessage'
import report from './moderators/report'
import slowmode from './moderators/slowmode'
import user from './moderators/user'
import nominate from './nominations/nominate'

export default [
  deleteAllMessage,
  nominate,
  report,
  user,
  slowmode,
] satisfies Plugin[]
