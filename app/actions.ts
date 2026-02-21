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

/**
 * Authenticates a user using the provided credentials.
 * @param prevState - The previous state of the form (for useFormState).
 * @param formData - The form data containing email and password.
 * @returns An error message if authentication fails, or redirects on success.
 */
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

/**
 * Registers a new user with the provided details.
 * @param prevState - The previous state of the form.
 * @param formData - The form data containing username, email, and password.
 * @returns A success or error message.
 */
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

/**
 * Logs out the current user.
 */
export async function logout() {
    await signOut()
}

const UpdateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    alias: z.string().optional(),
    bio: z.string().optional(),
})

/**
 * Updates the current user's profile information.
 * @param prevState - The previous state of the form.
 * @param formData - The form data containing name, alias, and bio.
 * @returns An object indicating success or error.
 */
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

/**
 * Sends a message to a user or a group.
 * @param content - The text content of the message.
 * @param groupId - The ID of the group to send to (optional).
 * @param receiverId - The ID of the user to send to (optional).
 * @param type - The type of message (default: 'text').
 * @param metadata - Additional metadata for the message.
 * @returns 'success' or an error message.
 */
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

/**
 * Retrieves messages for a specific group or direct message conversation.
 * @param groupId - The ID of the group to fetch messages for.
 * @param otherUserId - The ID of the other user in a direct message conversation.
 * @returns An array of messages with sender details.
 */
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

/**
 * Retrieves a list of users for the chat interface.
 * Also updates the current user's 'lastSeen' status.
 * @returns An array of users with selected fields.
 */
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

/**
 * Sends a friend request to another user.
 * @param targetUserId - The ID of the user to send the request to.
 * @returns 'success' or an error message.
 */
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

/**
 * Accepts a pending friend request.
 * Creates a friendship record for both users and deletes the request.
 * @param requestId - The ID of the friend request to accept.
 * @returns 'success' or an error message.
 */
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

/**
 * Retrieves unread notifications for the current user.
 * @returns An array of unread notifications.
 */
export async function getNotifications() {
    const session = await auth()
    if (!session?.user?.id) return []
    const userId = session.user.id

    return await prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' }
    })
}

/**
 * Marks a specific notification as read.
 * @param id - The ID of the notification to mark as read.
 * @returns 'success' or an error message.
 */
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

// ========== VERSUS MODE ==========

/**
 * Creates a new versus match challenge.
 */
export async function createVersusMatch(gameId: string, challengedId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }
    const userId = session.user.id

    if (userId === challengedId) return { error: 'Cannot challenge yourself' }

    try {
        const match = await prisma.versusMatch.create({
            data: {
                gameId,
                challengerId: userId,
                challengedId,
                status: 'pending',
            }
        })
        return { matchId: match.id }
    } catch (error) {
        return { error: 'Failed to create match' }
    }
}

/**
 * Accepts a pending versus match, setting its status to 'active'.
 */
export async function acceptVersusMatch(matchId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }
    const userId = session.user.id

    try {
        const match = await prisma.versusMatch.findUnique({ where: { id: matchId } })
        if (!match) return { error: 'Match not found' }
        if (match.challengedId !== userId) return { error: 'Not your match to accept' }
        if (match.status !== 'pending') return { error: 'Match already started or completed' }

        await prisma.versusMatch.update({
            where: { id: matchId },
            data: { status: 'active' }
        })
        return { success: true, gameId: match.gameId }
    } catch (error) {
        return { error: 'Failed to accept match' }
    }
}

/**
 * Updates the caller's score in a versus match.
 * scoreData is a JSON string with game-specific stats.
 */
export async function updateVersusScore(matchId: string, scoreData: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }
    const userId = session.user.id

    try {
        const match = await prisma.versusMatch.findUnique({ where: { id: matchId } })
        if (!match) return { error: 'Match not found' }

        const isChallenger = match.challengerId === userId
        const isChallenged = match.challengedId === userId
        if (!isChallenger && !isChallenged) return { error: 'Not a participant' }

        await prisma.versusMatch.update({
            where: { id: matchId },
            data: isChallenger
                ? { challengerScore: scoreData }
                : { challengedScore: scoreData }
        })
        return { success: true }
    } catch (error) {
        return { error: 'Failed to update score' }
    }
}

/**
 * Retrieves a versus match with both players' info.
 */
export async function getVersusMatch(matchId: string) {
    try {
        const match = await prisma.versusMatch.findUnique({
            where: { id: matchId },
            include: {
                challenger: { select: { id: true, name: true, image: true, alias: true } },
                challenged: { select: { id: true, name: true, image: true, alias: true } },
            }
        })
        return match
    } catch (error) {
        return null
    }
}
