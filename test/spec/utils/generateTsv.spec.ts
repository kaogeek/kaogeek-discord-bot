import { expect, test } from 'vitest'

import { generateTsv } from '../../../src/utils/generateTsv'

test('generates tsv data', async () => {
  const data = [
    ['hello', 'naughty\tstring', 'another\nnauty\nstring'],
    ['another row', 'ok', 'ok'],
  ]
  expect(generateTsv(data)).toEqual(
    'hello\tnaughty string\tanother nauty string\nanother row\tok\tok',
  )
})
