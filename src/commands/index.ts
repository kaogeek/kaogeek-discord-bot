import { Plugin } from '@/types/Plugin'

import report from './moderators/report'
import slowmode from './moderators/slowmode'

export default [report, slowmode] satisfies Plugin[]
