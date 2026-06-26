import { prisma } from '@/lib/db'
import { cookies } from "next/headers"

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const SESSION_COOKIE_NAME = 'session_token'

export class SessionService {
    static async create(userId: string) {
        const token = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + SESSION_TIMEOUT)

        await prisma.session.create({
            data: { id: token, userId, expiresAt }
        })

        const cookieStore = await cookies()
        cookieStore.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: SESSION_TIMEOUT / 1000
        })

        return token
    }

    static async validate(userId: string) {
        const cookieStore = await cookies()
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
        if (!token) return null

        const session = await prisma.session.findUnique({
            where: { id: token }
        })
        if (!session || session.userId !== userId) return null
        if (session.expiresAt < new Date()) {
            await prisma.session.delete({
                where: { id: token }
            })
            return null
        }

        return { userId: session.userId }
    }

    static async destroy() {
        const cookieStore = await cookies()
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
        if (!token) return null

        await prisma.session.deleteMany({
            where: { id: token }
        })

        cookieStore.delete(SESSION_COOKIE_NAME)

        return null
    }
}
