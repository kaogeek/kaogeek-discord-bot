import { expect, test } from 'vitest'

import { checkNameAgainstPatterns } from './checkNameAgainstPatterns'

test('case insensitive', async () => {
  expect(checkNameAgainstPatterns('Test', [{ regexp: 'test' }])).toBeTruthy()
})

test('whitespace tolerance', async () => {
  expect(checkNameAgainstPatterns('t e s t', [{ regexp: 'test' }])).toBeTruthy()
})

test('not match', async () => {
  expect(checkNameAgainstPatterns('Innocent', [{ regexp: 'test' }])).toBeFalsy()
})
