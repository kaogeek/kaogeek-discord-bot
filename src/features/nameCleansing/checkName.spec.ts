import { expect, test } from 'vitest'

import { checkZalgo } from './checkName'

test('zalgo', async () => {
  expect(checkZalgo('T̴̤̓e̴͎͗ś̶̖t̴͈̓')).toBeTruthy()
})

test('zalgo with whitespace', async () => {
  expect(checkZalgo('T̴͍̱̑̕ ̵̹̠͋ḛ̷͝ ̴̗̅͠s̵͖̤̀̍ ̵̗̉͗ṫ̴̙̚')).toBeTruthy()
})

test('dehoisted', async () => {
  expect(checkZalgo('! Test')).toBeTruthy()
})

test('exclamation mark', async () => {
  expect(checkZalgo('!')).toBeTruthy()
})

test('Bad Name', async () => {
  expect(checkZalgo('examplebadname')).toBeTruthy()
})
