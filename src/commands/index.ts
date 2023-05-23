import { CommandHandlerConfig } from '@/types/CommandHandlerConfig'

import ping from './info/ping'
import activeThreads from './moderators/activeThreads'
import deleteAllMessage from './moderators/deleteAllMessage'
import inspectProfile from './moderators/inspectProfile'
import report from './moderators/report'
import user from './moderators/user'
import inspectConfig from './runtimeConfig/inspectConfig'
import reloadConfig from './runtimeConfig/reloadConfig'

export default [
  activeThreads,
  deleteAllMessage,
  inspectConfig,
  ...inspectProfile,
  ping,
  reloadConfig,
  report,
  user,
] satisfies CommandHandlerConfig[]
