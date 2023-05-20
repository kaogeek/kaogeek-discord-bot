import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
{
  //This scope is only to check whether the table in DB exist.
  //If table does not exist execute "pnpm prisma db push".
  try {
    await prisma.messageReportCount.findFirst()
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        'The table `main.MessageReportCount` does not exist in the current database',
      )
    ) {
      console.error(
        'It seems like you haven\'t initialized database yet, please run command "pnpm prisma db push"',
      )
    } else {
      console.log(error)
    }
  }
}

export { prisma }
