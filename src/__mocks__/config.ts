import type { Environment as TEnvironment } from '../config.js'
import { fake } from '../utils/fake.js'

export const Environment = fake<TEnvironment>('FakeEnvironment', {
  BOT_CONFIG: 'file:./bot-config.toml',
  BOT_TOKEN: 'fake-token',
  PRISMA_LOG: false,
})
