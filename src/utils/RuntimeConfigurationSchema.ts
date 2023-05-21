import { z } from 'zod'

export const RuntimeConfigurationSchema = z.object({})
export type RuntimeConfigurationSchema = z.infer<
  typeof RuntimeConfigurationSchema
>
