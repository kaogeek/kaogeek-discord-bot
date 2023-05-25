import { Plugin } from '@/types/Plugin'

import nameChecker from './nameChecker'
import preventEmojiSpam from './preventEmojiSpam'
import stickyMessage from './stickyMessage'

export default [nameChecker, preventEmojiSpam, stickyMessage] as Plugin[]
