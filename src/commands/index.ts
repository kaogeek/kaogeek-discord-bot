import { Plugin } from '@/types/Plugin'

import deleteAllMessage from './moderators/deleteAllMessage'
import inspectProfile from './moderators/inspectProfile'
import report from './moderators/report'
import slowmode from './moderators/slowmode'
import user from './moderators/user'
import nominate from './nominations/nominate'
import inspectConfig from './runtimeConfig/inspectConfig'
import reloadConfig from './runtimeConfig/reloadConfig'

export default [
  deleteAllMessage,
  inspectConfig,
  ...inspectProfile,
  nominate,
  reloadConfig,
  report,
  user,
  slowmode,
] satisfies Plugin[]
