
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { games } from '../lib/games'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)

    // Seed Users
    const users = ['demo1', 'demo2', 'demo3', 'admin']

    for (const username of users) {
        await prisma.user.upsert({
            where: { email: `${username}@example.com` },
            update: {
                role: username === 'admin' ? 'admin' : 'user',
            },
            create: {
                email: `${username}@example.com`,
                name: username,
                password,
                role: username === 'admin' ? 'admin' : 'user',
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                alias: username.charAt(0).toUpperCase() + username.slice(1),
                bio: `I am ${username}, a demo user.`,
                favorites: '[]',
                stats: '{}'
            },
        })
        console.log(`Seeded user: ${username}`)
    }

    // Seed Games
    console.log('Seeding games...')
    for (const game of games) {
        await prisma.game.upsert({
            where: { id: game.id },
            update: {
                title: game.title,
                title_es: game.title_es,
                description: game.description,
                description_es: game.description_es,
                thumbnail: game.thumbnail,
                path: game.path,
                category: game.category,
                theme: JSON.stringify(game.theme),
                difficulty: game.difficulty,
                tags: JSON.stringify(game.tags || []),
                isNew: game.isNew || false,
                isFeatured: game.isFeatured || false,
            },
            create: {
                id: game.id,
                title: game.title,
                title_es: game.title_es,
                description: game.description,
                description_es: game.description_es,
                thumbnail: game.thumbnail,
                path: game.path,
                category: game.category,
                theme: JSON.stringify(game.theme),
                difficulty: game.difficulty,
                tags: JSON.stringify(game.tags || []),
                isNew: game.isNew || false,
                isFeatured: game.isFeatured || false,
            }
        })
    }
    console.log(`Seeded ${games.length} games`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
