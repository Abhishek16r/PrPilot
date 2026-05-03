import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'white',
    }}>
      <div style={{ maxWidth: '680px', width: '100%', textAlign: 'center' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '999px',
          padding: '6px 16px',
          fontSize: '13px',
          color: '#a5b4fc',
          marginBottom: '2rem',
        }}>
          <span>✨</span>
          <span>AI-Powered Code Reviews</span>
        </div>

        {/* Logo + Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🤖</div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
            marginBottom: '1rem',
          }}>
            PRPilot
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#94a3b8',
            lineHeight: 1.6,
          }}>
            Senior developer reviews every PR automatically.<br />
            Catches bugs, security issues, and bad patterns instantly.
          </p>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          {[
            { icon: '🐛', title: 'Bug Detection', desc: 'Catches logic errors before merge' },
            { icon: '🔒', title: 'Security Scan', desc: 'Spots vulnerabilities instantly' },
            { icon: '📊', title: 'Score & Track', desc: 'Watch quality improve over time' },
          ].map((feature) => (
            <div key={feature.title} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '1.5rem 1rem',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{feature.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{feature.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link href="/api/auth/login" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'white',
          color: '#0f172a',
          padding: '14px 32px',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '1rem',
          textDecoration: 'none',
          transition: 'transform 0.2s',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Continue with GitHub
        </Link>

        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#475569' }}>
          Free forever · No credit card required · Open source
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {[
            { value: '$0', label: 'Monthly cost' },
            { value: '<60s', label: 'Review time' },
            { value: '100%', label: 'Automated' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#a5b4fc' }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
