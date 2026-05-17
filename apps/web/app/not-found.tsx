import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
      padding: 'clamp(1rem, 4vw, 2rem)',
    }}>
      <div style={{
        fontSize: 'clamp(3rem, 12vw, 6rem)',
        marginBottom: 'clamp(1rem, 3vw, 2rem)',
        animation: 'rotate 4s linear infinite',
      }}>🤖</div>
      <h1 style={{
        fontSize: 'clamp(2rem, 8vw, 3.5rem)',
        fontWeight: '800',
        marginBottom: '0.5rem',
        letterSpacing: '-0.02em',
        background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        404
      </h1>
      <p style={{
        color: '#64748b',
        marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
        fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
      }}>
        This page doesn't exist or has been moved
      </p>
      <Link href="/" className="hover-cta" style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
        borderRadius: '12px',
        textDecoration: 'none',
        fontWeight: '700',
        fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
        transition: 'all 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
      }}>
        ← Go Home
      </Link>
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
