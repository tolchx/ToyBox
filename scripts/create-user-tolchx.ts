import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'tolchx@example.com'
    const password = 'tolchx'
    const name = 'tolchx'

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                alias: name,
                bio: 'Regular User',
                role: 'user',
                favorites: '[]',
                stats: '{}'
            },
        })
        console.log(`User created successfully: ${user.email}`)
    } catch (error) {
        console.error('Error creating user:', error)
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
