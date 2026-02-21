import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin', 10)

    await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { password: hashedPassword }
    })

    console.log('Admin password restored to "admin"')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
