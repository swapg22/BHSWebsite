import { NextResponse, type NextRequest } from 'next/server'

/** Sends staff to the two-factor-aware sign-in page instead of Payload's default login form. */
export function proxy(req: NextRequest) {
  return NextResponse.redirect(new URL('/staff/login', req.url))
}

export const config = { matcher: ['/admin/login'] }
