import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Testing Prisma Client query with lastSeen...')
    try {
        const users = await prisma.user.findMany({
            select: { id: true, lastSeen: true, name: true },
            take: 1,
            orderBy: { lastSeen: 'desc' }
        })
        console.log('Successfully queried users ordered by lastSeen:', JSON.stringify(users, null, 2))
    } catch (e) {
        console.error('Error querying users:', e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
