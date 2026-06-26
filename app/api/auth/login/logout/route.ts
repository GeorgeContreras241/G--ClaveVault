import { SessionService } from '@/server/services/SessionService'

export async function POST() {
  try {
    await SessionService.destroy()
    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ ok: false, error: 'Error al cerrar sesión' }, { status: 500 })
  }
}
