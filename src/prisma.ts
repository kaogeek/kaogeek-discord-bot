import { Prisma, PrismaClient } from '@prisma/client'

import { Environment } from './config.js'

export const prisma = new PrismaClient({
  ...(Environment.PRISMA_LOG
    ? { log: ['query', 'info', 'warn', 'error'] }
    : {}),
})

export { Prisma }
