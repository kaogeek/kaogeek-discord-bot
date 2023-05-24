import { randomUUID } from 'node:crypto'
import { unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { afterEach, expect, test } from 'vitest'

import { RuntimeConfiguration } from './RuntimeConfiguration.js'

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

test('should be able to load empty file', async () => {
  const runtimeConfiguration = new RuntimeConfiguration(createTestFile('').url)
  expect(await runtimeConfiguration.init()).toBeTruthy()
})

test('should keep the original config if there is an error reloading', async () => {
  const testFile = createTestFile('')
  const runtimeConfiguration = new RuntimeConfiguration(testFile.url)
  await runtimeConfiguration.init()
  const oldData = runtimeConfiguration.data
  testFile.update('(invalid toml)')
  await expect(() => runtimeConfiguration.reload()).rejects.toThrow()
  expect(runtimeConfiguration.data).toEqual(oldData)
})

let cleanUpTasks = [] as (() => void)[]

function createTestFile(contents: string) {
  const path = `${tmpdir()}/test-${randomUUID()}.toml`
  writeFileSync(path, contents)
  const update = (newContents: string) => writeFileSync(path, newContents)
  cleanUpTasks.push(() => unlinkSync(path))
  return { url: `file:${path}`, update }
}

afterEach(() => {
  for (const f of cleanUpTasks) f()
  cleanUpTasks = []
})
