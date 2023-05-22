import { expect, test } from 'vitest'

import { RuntimeConfiguration } from '../../src/utils/RuntimeConfiguration.js'

test('should correctly load the example config file', async () => {
  const runtimeConfiguration = new RuntimeConfiguration(
    'file:./bot-config.example.toml',
  )
  expect(await runtimeConfiguration.init()).toBeTruthy()
})

test('should fail to load invalid file', async () => {
  const runtimeConfiguration = new RuntimeConfiguration('file:./README.md')
  await expect(() => runtimeConfiguration.init()).rejects.toThrow()
})
