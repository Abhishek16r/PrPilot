'use client'

import { useEffect, useState } from 'react'

interface Session {
  userId: string
  username: string
  avatarUrl: string
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setSession(data))
      .catch(() => setSession(null))
  }, [])

  return session
}
