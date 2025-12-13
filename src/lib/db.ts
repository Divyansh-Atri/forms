// Prisma client stub - will work after running: npx prisma generate
// This requires DATABASE_URL to be set in .env
// For now, we create a type-safe stub

// Uncomment after running: npx prisma generate
// import { PrismaClient } from '@prisma/client'
// 
// const globalForPrisma = globalThis as unknown as {
//     prisma: PrismaClient | undefined
// }
// 
// export const prisma = globalForPrisma.prisma ?? new PrismaClient()
// 
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
// 
// export default prisma

// Temporary stub until Prisma is configured
type PrismaClientStub = {
    // Add stub methods as needed
    $connect: () => Promise<void>
    $disconnect: () => Promise<void>
}

const prismaStub: PrismaClientStub = {
    $connect: async () => { console.log('Prisma not configured') },
    $disconnect: async () => { console.log('Prisma not configured') },
}

export const prisma = prismaStub
export default prisma
