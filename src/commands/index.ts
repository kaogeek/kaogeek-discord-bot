import { CommandHandlerConfig } from '../types/CommandHandlerConfig.js'

import ping from './info/ping.js'
import activeThreads from './moderators/activeThreads.js'
import deleteAllMessage from './moderators/deleteAllMessage.js'
import inspectProfile from './moderators/inspectProfile.js'
import micMuteAppeal from './moderators/micMuteAppeal.js'
import report from './moderators/report.js'
import severeMute from './moderators/severeMute.js'
import severeMutePardon from './moderators/severeMutePardon.js'
import user from './moderators/user.js'
import inspectConfig from './runtimeConfig/inspectConfig.js'
import reloadConfig from './runtimeConfig/reloadConfig.js'

export default [
  activeThreads,
  deleteAllMessage,
  inspectConfig,
  ...inspectProfile,
  ping,
  reloadConfig,
  report,
  user,
  micMuteAppeal,
  ...severeMute,
  ...severeMutePardon,
] satisfies CommandHandlerConfig[]
