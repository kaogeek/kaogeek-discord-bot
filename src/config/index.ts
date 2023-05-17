import { config } from 'dotenv'
import { z } from 'zod'

config()

export const EnvironmentSchema = z.object({
  BOT_TOKEN: z.string(),
})

export const Environment = EnvironmentSchema.parse(process.env)
export type Environment = z.infer<typeof EnvironmentSchema>
