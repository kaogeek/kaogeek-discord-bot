import { RuntimeConfigurationSchema } from '@/utils/RuntimeConfigurationSchema'

import { compiled } from './checkName'

type Pattern = RuntimeConfigurationSchema['nameChecker']['patterns'][number]

export function checkNameAgainstPatterns(
  name: string,
  patterns: Pattern[],
  logError = console.error,
): RegExp | undefined {
  for (const pattern of patterns) {
    try {
      let regexp = compiled.get(pattern.regexp)
      if (!regexp) {
        regexp = new RegExp(pattern.regexp, 'i')
        compiled.set(pattern.regexp, regexp)
      }
      if (regexp.test(name) || regexp.test(name.replaceAll(/\s+/g, ''))) {
        return regexp
      }
    } catch (error) {
      logError(
        `Unable to process pattern "${pattern}" against name "${name}"`,
        error,
      )
    }
  }
}
