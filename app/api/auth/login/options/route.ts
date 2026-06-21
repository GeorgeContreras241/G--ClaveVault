// TODO: Implementar login options
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // validation email
    if (!email || typeof email !== 'string') {
      return Response.json({ ok: false, error: 'Email es requerido' }, { status: 400 })
    }

  } catch (error) {
    return Response.json({ ok: false, error: 'Error al generar opciones' }, { status: 500 })
  }
}
