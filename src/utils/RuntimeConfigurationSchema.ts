import { z } from 'zod'

export const RuntimeConfigurationSchema = z
  .object({
    preventEmojiSpam: z
      .object({
        enabled: z.boolean().default(true),
      })
      .default({}),
  })
  .default({})

export type RuntimeConfigurationSchema = z.infer<
  typeof RuntimeConfigurationSchema
>
