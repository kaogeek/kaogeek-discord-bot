import { Plugin } from '@/types/Plugin'

import memberUpdateLogger from './memberUpdateLogger'
import nameChecker from './nameChecker'
import ping from './ping'
import preventEmojiSpam from './preventEmojiSpam'
import stickyMessage from './stickyMessage'
import threadPruner from './threadPruner'

export default [
  memberUpdateLogger,
  nameChecker,
  ping,
  preventEmojiSpam,
  stickyMessage,
  threadPruner,
] as Plugin[]
