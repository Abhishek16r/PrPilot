import { cookies } from 'next/headers'

export interface Session {
  userId: string
  username: string
  avatarUrl: string
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) return null

  try {
    return JSON.parse(Buffer.from(session, 'base64').toString('utf-8')) as Session
  } catch {
    return null
  }
}
