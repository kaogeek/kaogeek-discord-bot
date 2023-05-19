import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
{
  //This scope is only to check whether the table in DB exist.
  //If table does not exist execute "pnpm prisma db push".
  try {
    await prisma.messageReportCount.findFirst()
  } catch (error) {
    console.log(error)
  }
}

export { prisma }
