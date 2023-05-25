import { z } from 'zod'

export const RuntimeConfigurationSchema = z
  .object({
    nameChecker: z
      .object({
        patterns: z.array(z.object({ regexp: z.string() })).default([]),
        reportChannelId: z.string().default(''),
      })
      .default({}),

    nominations: z
      .object({
        enabledRoles: z
          .array(
            z.object({
              roleId: z.string(),
              nominationsChannelId: z.string(),
            }),
          )
          .default([]),
      })
      .default({}),

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
