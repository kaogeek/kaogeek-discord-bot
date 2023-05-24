import { expect, test } from 'vitest'

import { toLocalDate } from './toLocalDate'

test.each([
  // ISO-8601 date string
  { input: '2023-05-14T10:00:00.000Z', output: '2023-05-14 17:00:00' },

  // timestamp
  { input: 0, output: '1970-01-01 07:00:00' },

  // date object
  { input: new Date('2023-05-14T10:00:00Z'), output: '2023-05-14 17:00:00' },
])('formatting date ($input)', async ({ input, output }) => {
  expect(toLocalDate(input)).toEqual(output)
})
