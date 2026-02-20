
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
    try {
        console.log("GET /api/games/status start");
        const session = await auth();
        console.log("Session:", session?.user?.email);

        // Fetch globally deleted games
        const deletedGames = await prisma.globalDeletedGame.findMany({
            select: { gameId: true }
        });
        const deletedIds = deletedGames.map((g: any) => g.gameId);
        console.log("Deleted Games:", deletedIds);

        let hiddenIds: string[] = [];

        if (session?.user?.id) {
            // Fetch user-specific hidden games
            const hiddenGames = await prisma.userHiddenGame.findMany({
                where: { userId: session.user.id },
                select: { gameId: true }
            });
            hiddenIds = hiddenGames.map((g: any) => g.gameId);
            console.log("Hidden Games:", hiddenIds);
        }

        return NextResponse.json({
            deleted: deletedIds,
            hidden: hiddenIds
        });
    } catch (e) {
        console.error("Error in GET /api/games/status:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
