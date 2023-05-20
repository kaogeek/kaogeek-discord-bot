import { CommandHandlerConfig } from '../types/CommandHandlerConfig.js'

import ping from './info/ping.js';
import kaokaiToday from './users/kaokaiToday.js';
import activeThreads from './moderators/activeThreads.js'
import deleteAllMessage from './moderators/deleteAllMessage.js'
import inspectProfile from './moderators/inspectProfile.js'
import report from './moderators/report.js'
import user from './moderators/user.js'

export default [
  activeThreads,
  deleteAllMessage,
  ...inspectProfile,
  ping,
  kaokaiToday,
  report,
  user,
] satisfies CommandHandlerConfig[]
