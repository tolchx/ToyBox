import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password || "");
                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            if (session?.user && token.sub) {
                // @ts-ignore
                session.user.id = token.sub;

                // Fetch fresh data from DB to ensure updates are reflected immediately
                try {
                    const freshUser = await prisma.user.findUnique({
                        where: { id: token.sub }
                    });
                    if (freshUser) {
                        session.user.name = freshUser.name;
                        session.user.image = freshUser.image;
                        // @ts-ignore
                        session.user.alias = freshUser.alias;
                        // @ts-ignore
                        session.user.bio = freshUser.bio;
                        // @ts-ignore
                        session.user.role = freshUser.role;
                    }
                } catch (e) {
                    console.error("Failed to refresh session user data", e);
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
    session: {
        strategy: "jwt",
    },
})
