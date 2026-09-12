import { SessionService } from '@/server/services/SessionService'

export async function POST() {
  console.log("[/api/auth/login/logout] Cerrando sesión del usuario")
  try {
    await SessionService.destroy()
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false, error: 'Error al cerrar sesión' }, { status: 500 })
  }
}
