import { expect, test } from 'vitest'

import { checkNameAgainstPatterns } from './checkNameAgainstPatterns'

test('case insensitive', async () => {
  expect(
    checkNameAgainstPatterns('Test', [{ regexp: 'test' }], false),
  ).toBeTruthy()
})

test('whitespace tolerance', async () => {
  expect(
    checkNameAgainstPatterns('t e s t', [{ regexp: 'test' }], false),
  ).toBeTruthy()
})

test('not match', async () => {
  expect(
    checkNameAgainstPatterns('Innocent', [{ regexp: 'test' }], false),
  ).toBeFalsy()
})

test('zalgo', async () => {
  expect(
    checkNameAgainstPatterns('T̴̤̓e̴͎͗ś̶̖t̴͈̓', [{ regexp: 'test' }], true),
  ).toBeTruthy()
})

test('zalgo with whitespace', async () => {
  expect(
    checkNameAgainstPatterns('T̴͍̱̑̕ ̵̹̠͋ḛ̷͝ ̴̗̅͠s̵͖̤̀̍ ̵̗̉͗ṫ̴̙̚', [{ regexp: 'test' }], true),
  ).toBeTruthy()
})
