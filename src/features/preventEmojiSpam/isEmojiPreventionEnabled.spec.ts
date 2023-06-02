import { expect, test } from 'vitest'

import { RuntimeConfigurationSchema } from '@/utils/RuntimeConfigurationSchema'

import { isEmojiPreventionEnabled } from './isEmojiPreventionEnabled'

const config: RuntimeConfigurationSchema['preventEmojiSpam'] = {
  enabled: false,
  enabledChannels: ['1', '4'],
  disabledChannels: ['2', '4'],
  bypassRoles: [],
}

const member = {
  roles: {
    cache: {
      has: (roleId: string) => roleId === '99',
    },
  },
}

test('enabled', () => {
  const testConfig = { ...config, enabled: true }
  expect(isEmojiPreventionEnabled(testConfig, { id: '3' }, member)).toBe(true)
})

test('disabled', () => {
  const testConfig = { ...config }
  expect(isEmojiPreventionEnabled(testConfig, { id: '2' }, member)).toBe(false)
})

test('enabledChannels', () => {
  const testConfig = { ...config }
  expect(isEmojiPreventionEnabled(testConfig, { id: '1' }, member)).toBe(true)
})

test('disabledChannels', () => {
  const testConfig = { ...config, enabled: true }
  expect(isEmojiPreventionEnabled(testConfig, { id: '2' }, member)).toBe(false)
})

test('disabledChannels wins over enabledChannels', () => {
  const testConfig = { ...config, enabled: false }
  expect(isEmojiPreventionEnabled(testConfig, { id: '4' }, member)).toBe(false)
})

test('role bypass', () => {
  const testConfig = { ...config, enabled: true, bypassRoles: ['99'] }
  expect(isEmojiPreventionEnabled(testConfig, { id: '3' }, member)).toBe(false)
})
