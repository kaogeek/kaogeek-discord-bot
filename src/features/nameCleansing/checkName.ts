import { clean, isZalgo } from 'unzalgo'

import { Logger } from '@/types/Logger'
import { RuntimeConfigurationSchema } from '@/utils/RuntimeConfigurationSchema'

import { compiled } from './nameCleansing'

type Pattern = RuntimeConfigurationSchema['nameChecker']['patterns'][number]

export function checkNameAgainstPatterns(
  name: string,
  patterns: Pattern[],
  log: Logger = console,
): boolean | undefined {
  for (const pattern of patterns) {
    try {
      let regexp = compiled.get(pattern.regexp)
      if (!regexp) {
        regexp = new RegExp(pattern.regexp, 'i')
        compiled.set(pattern.regexp, regexp)
      }
      if (regexp.test(name) || regexp.test(name.replaceAll(/\s+/g, ''))) {
        return true
      }
    } catch (error) {
      log.error(
        `Unable to process pattern "${pattern}" against name "${name}"`,
        error,
      )
    }
  }
  return false
}

export function checkZalgo(name: string) {
  return isZalgo(name.trim())
}

export function checkDehoisted(name: string) {
  return clean(name.trim()).startsWith('!')
}

export function checkExclamationMark(name: string) {
  return clean(name.trim()) === '!'
}
