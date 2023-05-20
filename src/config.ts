import 'dotenv/config'

import { Env } from '@(-.-)/env'
import { z } from 'zod'

export const EnvironmentSchema = z.object({
  BOT_TOKEN: z.string(),
  GUILD_ID: z.string(),
  MOD_CHANNEL_ID: z.string(),
  FLAG_ROLE_ID: z.string(),
  DATABASE_URL: z.string(),
  PRISMA_LOG: z.coerce.boolean().default(false),
})

export const Environment = Env(EnvironmentSchema)
export type Environment = z.infer<typeof EnvironmentSchema>
