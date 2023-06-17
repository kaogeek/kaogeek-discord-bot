import { z } from 'zod'

export const RuntimeConfigurationSchema = z
  .object({
    nameChecker: z
      .object({
        patterns: z.array(z.object({ regexp: z.string() })).default([]),
        reportChannelId: z.string().default(''),
        zalgoEnabled: z.boolean().default(true),
      })
      .default({}),

    nameCleansing: z
      .object({
        enabled: z.boolean().default(false),
        enabledCheckZalgo: z.boolean().default(false),
        enabledCheckDehoisted: z.boolean().default(false),
        enabledCheckExclamationMark: z.boolean().default(false),
        enabledCheckBadName: z.boolean().default(false),
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
        enabledChannels: z.array(z.string()).default([]),
        disabledChannels: z.array(z.string()).default([]),
        bypassRoles: z.array(z.string()).default([]),
      })
      .default({}),
  })
  .default({})

export type RuntimeConfigurationSchema = z.infer<
  typeof RuntimeConfigurationSchema
>
