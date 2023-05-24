import { Prisma, PrismaClient } from '@prisma/client'

import { Environment } from './config'

export const prisma = new PrismaClient({
  ...(Environment.PRISMA_LOG
    ? { log: ['query', 'info', 'warn', 'error'] }
    : {}),
})

export const isUniqueConstraintViolation = (
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002'
