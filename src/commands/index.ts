import { Plugin } from '@/types/Plugin'

import deleteAllMessage from './moderators/deleteAllMessage'
import report from './moderators/report'
import slowmode from './moderators/slowmode'
import user from './moderators/user'

export default [deleteAllMessage, report, user, slowmode] satisfies Plugin[]
