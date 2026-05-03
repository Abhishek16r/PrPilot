import { NextResponse } from 'next/server'

export async function GET() {
  const state = crypto.randomUUID()
  
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_REDIRECT_URI!,
    scope: 'user:email repo',
    state,
  })

  const githubUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

  const response = NextResponse.redirect(githubUrl)

  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })

  return response
}
