import 'dotenv/config'

import { Env } from '@(-.-)/env'
import { z } from 'zod'

export const EnvironmentSchema = z.object({
  SMOKE_TESTER_BOT_TOKEN: z.string(),
  GUILD_ID: z.string(),
  MOD_CHANNEL_ID: z.string(),
})

export const Environment = Env(EnvironmentSchema)
export type Environment = z.infer<typeof EnvironmentSchema>
