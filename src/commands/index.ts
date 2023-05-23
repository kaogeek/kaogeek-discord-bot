import { CommandHandlerConfig } from '@/types/CommandHandlerConfig.ts'

import ping from './info/ping.ts'
import activeThreads from './moderators/activeThreads.ts'
import deleteAllMessage from './moderators/deleteAllMessage.ts'
import inspectProfile from './moderators/inspectProfile.ts'
import report from './moderators/report.ts'
import user from './moderators/user.ts'
import inspectConfig from './runtimeConfig/inspectConfig.ts'
import reloadConfig from './runtimeConfig/reloadConfig.ts'

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
