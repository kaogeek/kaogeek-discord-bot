import { Plugin } from '@/types/Plugin'

import report from './moderators/report'
import slowmode from './moderators/slowmode'
import user from './moderators/user'

export default [report, user, slowmode] satisfies Plugin[]
