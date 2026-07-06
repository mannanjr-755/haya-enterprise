import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { UserRole } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'haya-enterprise-dev-secret-change-in-production',
)

export interface SessionPayload {
  userId: string
  username: string
  name: string
  role: UserRole
  exp?: number
}

const COOKIE_NAME = 'haya_session'
const SESSION_DURATION = 60 * 60 * 8 // 8 hours

export async function createSession(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export { COOKIE_NAME, SESSION_DURATION }
