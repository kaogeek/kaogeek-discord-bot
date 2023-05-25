import { Plugin } from '@/types/Plugin'

import memberUpdateLogger from './memberUpdateLogger'
import nameChecker from './nameChecker'
import ping from './ping'
import preventEmojiSpam from './preventEmojiSpam'
import profileInspector from './profileInspector'
import runtimeConfig from './runtimeConfig'
import stickyMessage from './stickyMessage'
import threadPruner from './threadPruner'

export default [
  memberUpdateLogger,
  nameChecker,
  ping,
  preventEmojiSpam,
  profileInspector,
  runtimeConfig,
  stickyMessage,
  threadPruner,
] as Plugin[]
