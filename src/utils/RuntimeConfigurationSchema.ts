import { z } from 'zod'

export const RuntimeConfigurationSchema = z
  .object({
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
