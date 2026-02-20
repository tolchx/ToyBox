
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { gameId, action } = body; // action: 'hide' | 'unhide' | 'delete' | 'restore'

    if (!gameId || !action) {
        return NextResponse.json({ error: "Missing gameId or action" }, { status: 400 });
    }

    // Admin Actions
    if (action === 'delete' || action === 'restore') {
        // @ts-ignore
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
        }

        if (action === 'delete') {
            try {
                await prisma.globalDeletedGame.upsert({
                    where: { gameId },
                    update: {},
                    create: {
                        gameId,
                        deletedBy: session.user.id
                    }
                });
            } catch (e) {
                // Ignore unique constraint violation if exists
            }
        } else {
            await prisma.globalDeletedGame.deleteMany({
                where: { gameId }
            });
        }
    }

    // User Actions
    else if (action === 'hide' || action === 'unhide') {
        if (action === 'hide') {
            try {
                await prisma.userHiddenGame.upsert({
                    where: {
                        userId_gameId: {
                            userId: session.user.id,
                            gameId
                        }
                    },
                    update: {},
                    create: {
                        userId: session.user.id,
                        gameId
                    }
                });
            } catch (e) {
                // Ignore unique constraint violation
            }
        } else {
            await prisma.userHiddenGame.deleteMany({
                where: {
                    userId: session.user.id,
                    gameId
                }
            });
        }
    } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
