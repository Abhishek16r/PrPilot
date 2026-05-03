import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        This page doesn't exist
      </p>
      <Link href="/" style={{
        background: 'rgba(99,102,241,0.15)',
        color: '#a5b4fc',
        padding: '10px 24px',
        borderRadius: '10px',
        textDecoration: 'none',
        fontWeight: '500',
      }}>
        Go home
      </Link>
    </div>
  )
}
