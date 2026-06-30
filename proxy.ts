import { NextRequest, NextResponse } from "next/server"
import { SessionService } from "@/server/services"

export async function proxy(request: NextRequest) {
  const session = await SessionService.validate()

  if (!session) {
    return NextResponse.redirect(new URL("/online", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/passwords/:path*"],
}
