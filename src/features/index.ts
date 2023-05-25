import { Plugin } from '@/types/Plugin'

import memberUpdateLogger from './memberUpdateLogger'
import messagePruner from './messagePruner'
import nameChecker from './nameChecker'
import nominations from './nominations'
import ping from './ping'
import preventEmojiSpam from './preventEmojiSpam'
import profileInspector from './profileInspector'
import runtimeConfig from './runtimeConfig'
import stickyMessage from './stickyMessage'
import threadPruner from './threadPruner'

export default [
  memberUpdateLogger,
  messagePruner,
  nameChecker,
  nominations,
  ping,
  preventEmojiSpam,
  profileInspector,
  runtimeConfig,
  stickyMessage,
  threadPruner,
] as Plugin[]
