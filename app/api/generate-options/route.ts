 import { generateRegistrationOptions } from '@simplewebauthn/server'
 

export async function GET() {
  return Response.json({
    ok: true,
    message: "API funcionando"
  });
}