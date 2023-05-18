import { Env } from '@(-.-)/env'
import { config } from 'dotenv'
import { z } from 'zod'

config()

export const EnvironmentSchema = z.object({
  BOT_TOKEN: z.string(),
  GUILD_ID: z.string(),
  MOD_CHANNEL_ID: z.string(),
  FLOOD_SPAM_MAX_MESSAGES: z.preprocess(
    (a) => parseInt(a as string, 10),
    z.number().positive(),
  ),
  FLOOD_SPAM_MAX_TIME_MS: z.preprocess(
    (a) => parseInt(a as string, 10),
    z.number().positive(),
  ),
})

export const Environment = Env(EnvironmentSchema)
export type Environment = z.infer<typeof EnvironmentSchema>
