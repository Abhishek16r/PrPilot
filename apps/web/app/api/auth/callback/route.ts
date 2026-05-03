import { NextRequest, NextResponse } from 'next/server'
import { sql } from '../../../lib/db'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const storedState = request.cookies.get('github_oauth_state')?.value

  if (!code || !state || state !== storedState) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      }),
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      console.error('No access token:', tokenData)
      throw new Error('Failed to get access token')
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })
    const githubUser = await userResponse.json()

    const existingUser = await sql`
      SELECT id FROM users WHERE github_id = ${String(githubUser.id)} LIMIT 1
    `

    let userId: string

    if (existingUser.length === 0) {
      const newUser = await sql`
        INSERT INTO users (id, github_id, username, email, avatar_url, access_token)
        VALUES (
          gen_random_uuid(),
          ${String(githubUser.id)},
          ${githubUser.login},
          ${githubUser.email ?? ''},
          ${githubUser.avatar_url ?? ''},
          ${accessToken}
        )
        RETURNING id
      `
      userId = newUser[0]?.id as string
    } else {
      userId = existingUser[0]?.id as string
      await sql`
        UPDATE users SET access_token = ${accessToken}, updated_at = NOW()
        WHERE id = ${userId}
      `
    }

    const session = Buffer.from(JSON.stringify({
      userId,
      username: githubUser.login,
      avatarUrl: githubUser.avatar_url,
    })).toString('base64')

    const response = NextResponse.redirect(
      new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL)
    )

    response.cookies.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(
      new URL('/?error=auth_failed', process.env.NEXT_PUBLIC_APP_URL)
    )
  }
}
