import { Plugin } from '@/types/Plugin'

import memberUpdateLogger from './memberUpdateLogger'
import nameChecker from './nameChecker'
import ping from './ping'
import preventEmojiSpam from './preventEmojiSpam'
import stickyMessage from './stickyMessage'

export default [
  memberUpdateLogger,
  nameChecker,
  ping,
  preventEmojiSpam,
  stickyMessage,
] as Plugin[]
