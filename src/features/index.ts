import { Plugin } from '@/types/Plugin'

import memberUpdateLogger from './memberUpdateLogger'
import nameChecker from './nameChecker'
import preventEmojiSpam from './preventEmojiSpam'
import stickyMessage from './stickyMessage'

export default [
  memberUpdateLogger,
  nameChecker,
  preventEmojiSpam,
  stickyMessage,
] as Plugin[]
