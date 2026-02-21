import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@example.com' }
    })

    if (user) {
        console.log('User found:', user.email)
        console.log('Has password hash:', !!user.password)

        const isPasswordAdmin = await bcrypt.compare('admin', user.password || '')
        console.log('Password is "admin":', isPasswordAdmin)

        const isPasswordAdmin123 = await bcrypt.compare('admin123', user.password || '')
        console.log('Password is "admin123":', isPasswordAdmin123)
    } else {
        console.log('Admin user not found')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
