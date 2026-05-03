import Link from 'next/link'
import { sql } from './lib/db'

export default async function HomePage() {
  // Fetch real stats
  let totalReviews = 0
  let avgScore = 0
  let totalIssues = 0

  try {
    const reviewCount = await sql`SELECT COUNT(*) as count FROM pull_requests`
    totalReviews = Number(reviewCount[0]?.count ?? 0)

    const scoreAvg = await sql`SELECT ROUND(AVG(overall_score)) as avg FROM reviews`
    avgScore = Number(scoreAvg[0]?.avg ?? 0)

    const issueCount = await sql`SELECT COUNT(*) as count FROM comments`
    totalIssues = Number(issueCount[0]?.count ?? 0)
  } catch {
    // DB not available, use defaults
  }

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
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '999px',
          padding: '6px 16px',
          fontSize: '13px',
          color: '#a5b4fc',
          marginBottom: '2rem',
        }}>
          <span>✨</span>
          <span>AI-Powered Code Reviews — Free Forever</span>
        </div>

        {/* Title */}
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
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
          Senior developer reviews every PR automatically.<br />
          Catches bugs, security issues, and bad patterns instantly.
        </p>

        {/* Features */}
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
          ].map((f) => (
            <div key={f.title} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '1.5rem 1rem',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
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

        {/* Real Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {[
            { value: totalReviews > 0 ? `${totalReviews}+` : '$0', label: totalReviews > 0 ? 'PRs Reviewed' : 'Monthly cost' },
            { value: avgScore > 0 ? `${avgScore}/100` : '<60s', label: avgScore > 0 ? 'Avg Score' : 'Review time' },
            { value: totalIssues > 0 ? `${totalIssues}+` : '100%', label: totalIssues > 0 ? 'Issues Found' : 'Automated' },
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
