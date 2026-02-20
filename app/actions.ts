'use server'

import { signIn, signOut, auth } from '@/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { AuthError } from 'next-auth'

const prisma = new PrismaClient()

// Validation Schemas
const RegisterSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        throw error
    }
}

export async function register(prevState: string | undefined, formData: FormData) {
    const validatedFields = RegisterSchema.safeParse({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return 'Missing Fields. Failed to Register.'
    }

    const { username, email, password } = validatedFields.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return 'Email already in use.'
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name: username,
                email,
                password: hashedPassword,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                alias: username,
                bio: '',
                favorites: '[]',
                stats: '{}'
            },
        })
    } catch (error) {
        return 'Database Error: Failed to Create User.'
    }

    // Automatically sign in after registration?
    // For now, let's redirect to login or just return success
    return 'success'
}

export async function logout() {
    await signOut()
}

const UpdateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    alias: z.string().optional(),
    bio: z.string().optional(),
})

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }
    const userId = session.user.id

    const validatedFields = UpdateProfileSchema.safeParse({
        name: formData.get('name'),
        alias: formData.get('alias'),
        bio: formData.get('bio'),
    })

    if (!validatedFields.success) {
        return { error: 'Invalid fields' }
    }

    try {
        console.log('Updating profile for user:', session.user.id);
        console.log('New data:', validatedFields.data);

        await prisma.user.update({
            // @ts-ignore
            where: { id: session.user.id },
            data: {
                name: validatedFields.data.name,
                alias: validatedFields.data.alias,
                bio: validatedFields.data.bio,
            },
        })
        console.log('Profile updated successfully');

        return { success: true }
    } catch (error) {
        console.error('Update profile error:', error)
        return { error: 'Failed to update profile' }
    }
}


// Social Actions

export async function sendMessage(content: string, groupId?: string, receiverId?: string, type: string = 'text', metadata: string | null = null) {
    const session = await auth()
    if (!session?.user?.id) return 'Unauthorized'
    const userId = session.user.id

    if (!content.trim()) return 'Empty message'

    // Basic sanitization (React escapes by default, but good to be safe if rendering HTML)
    // We will trust React for XSS protection for now.

    try {
        await prisma.message.create({
            data: {
                content,
                senderId: userId,
                receiverId: receiverId || null,
                groupId: groupId || null,
                type,
                metadata
            },
        })
        return 'success'
    } catch (error) {
        return 'Failed to send message'
    }
}

export async function getMessages(groupId?: string, otherUserId?: string) {
    const session = await auth()
    if (!session?.user?.id) return []
    const userId = session.user.id

    try {
        if (groupId) {
            if (groupId === 'global') {
                return await prisma.message.findMany({
                    where: { groupId: 'global' },
                    include: { sender: { select: { name: true, image: true, alias: true } } },
                    orderBy: { createdAt: 'asc' },
                    take: 50,
                })
            }
            // Implement other groups logic
        }

        // Direct messages
        if (otherUserId) {
            return await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: userId, receiverId: otherUserId },
                        { senderId: otherUserId, receiverId: userId },
                    ]
                },
                include: { sender: { select: { name: true, image: true, alias: true } } },
                orderBy: { createdAt: 'asc' },
                take: 50,
            })
        }

        return []
    } catch (error) {
        return []
    }
}

export async function getUsers() {
    const session = await auth()

    // Update lastSeen if authenticated
    if (session?.user?.id) {
        try {
            await prisma.user.update({
                // @ts-ignore
                where: { id: session.user.id },
                data: { lastSeen: new Date() }
            })
        } catch (e) {
            // Ignore error updating lastSeen
        }
    }

    // For demo: list all users to chat with
    const users = await prisma.user.findMany({
        select: { id: true, name: true, image: true, alias: true, role: true, lastSeen: true },
        take: 20,
        orderBy: { lastSeen: 'desc' }
    })
    return users
}

export async function sendFriendRequest(targetUserId: string) {
    const session = await auth()
    if (!session?.user?.id) return 'Unauthorized'
    const userId = session.user.id

    if (userId === targetUserId) return 'Cannot add yourself'

    try {
        await prisma.friendRequest.create({
            data: {
                senderId: userId,
                receiverId: targetUserId,
            }
        })

        // Create notification
        await prisma.notification.create({
            data: {
                userId: targetUserId,
                type: 'friend_request',
                content: `${session.user.name} sent you a friend request`,
            }
        })

        return 'success'
    } catch (error) {
        return 'Failed to send friend request'
    }
}

export async function acceptFriendRequest(requestId: string) {
    const session = await auth()
    if (!session?.user?.id) return 'Unauthorized'
    const userId = session.user.id

    try {
        const request = await prisma.friendRequest.findUnique({
            where: { id: requestId },
        })

        if (!request || request.receiverId !== userId) return 'Invalid request'

        // Transaction to create friendship and delete request
        await prisma.$transaction([
            prisma.friend.create({
                data: { userId: request.senderId, friendId: request.receiverId }
            }),
            prisma.friend.create({
                data: { userId: request.receiverId, friendId: request.senderId }
            }),
            prisma.friendRequest.delete({
                where: { id: requestId }
            }),
            prisma.notification.create({
                data: {
                    userId: request.senderId,
                    type: 'system',
                    content: `${session.user.name} accepted your friend request`,
                }
            })
        ])

        return 'success'
    } catch (error) {
        return 'Failed to accept friend request'
    }
}

export async function getNotifications() {
    const session = await auth()
    if (!session?.user?.id) return []
    const userId = session.user.id

    return await prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' }
    })
}

export async function markNotificationRead(id: string) {
    const session = await auth()
    if (!session?.user?.id) return 'Unauthorized'
    const userId = session.user.id

    await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true }
    })
    return 'success'
}
