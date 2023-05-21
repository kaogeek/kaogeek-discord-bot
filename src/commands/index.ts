import { CommandHandlerConfig } from '../types/CommandHandlerConfig.js'

import ping from './info/ping.js'
import activeThreads from './moderators/activeThreads.js'
import deleteAllMessage from './moderators/deleteAllMessage.js'
import inspectProfile from './moderators/inspectProfile.js'
import report from './moderators/report.js'
import stickyMessage from './moderators/stickyMessage.js'
import user from './moderators/user.js'

export default [
  activeThreads,
  deleteAllMessage,
  ...inspectProfile,
  ...stickyMessage,
  ping,
  report,
  user,
] satisfies CommandHandlerConfig[]
