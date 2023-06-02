import { expect, test } from 'vitest'

import { RuntimeConfigurationSchema } from '@/utils/RuntimeConfigurationSchema'

import { isEmojiPreventionEnabled } from './isEmojiPreventionEnabled'

const config: RuntimeConfigurationSchema['preventEmojiSpam'] = {
  enabled: true,
  enabledChannels: ['1', '4'],
  disabledChannels: ['2', '4'],
}

test('enabled', () => {
  expect(isEmojiPreventionEnabled(config, { id: '3' })).toBe(true)
})

test('disabled', () => {
  const testConfig = { ...config, enabled: false }
  expect(isEmojiPreventionEnabled(testConfig, { id: '2' })).toBe(false)
})

test('enabledChannels', () => {
  expect(isEmojiPreventionEnabled(config, { id: '1' })).toBe(true)
})

test('disabledChannels', () => {
  expect(isEmojiPreventionEnabled(config, { id: '2' })).toBe(false)
})

test('disabledChannels wins over enabledChannels', () => {
  expect(isEmojiPreventionEnabled(config, { id: '4' })).toBe(false)
})
