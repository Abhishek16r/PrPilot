import Link from 'next/link'
import { sql } from './lib/db'

export default async function HomePage() {
  const githubAppUrl = process.env.NEXT_PUBLIC_GITHUB_APP_URL || 'https://github.com/apps/prpilot-abhishek'

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
      background: 'linear-gradient(135deg, #07070c 0%, #0f0f1c 50%, #07070c 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(2rem, 5vw, 4rem) max(1.5rem, env(safe-area-inset-left), env(safe-area-inset-right))',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative Background Nebulas */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, rgba(139,92,246,0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 5vw, 3rem)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1440px',
        margin: '0 auto',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.3))' }}>🤖</span>
          <span style={{ fontWeight: '700', fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PRPilot</span>
        </div>
        <Link href="/api/auth/login" className="header-signin-btn" style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '8px 20px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#ffffff',
          transition: 'all 0.2s ease',
          textDecoration: 'none',
        }}>
          Sign In
        </Link>
      </div>

      <div style={{ maxWidth: '1140px', width: '100%', textAlign: 'center', zIndex: 5, padding: '0 1rem', marginTop: 'clamp(1.5rem, 4vw, 2.5rem)' }}>

        {/* Capsule Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '999px',
          padding: '6px 14px',
          fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
          color: '#a5b4fc',
          marginBottom: 'clamp(1.5rem, 6vw, 2.5rem)',
          fontWeight: '500',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(99,102,241,0.1)',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#818cf8',
            boxShadow: '0 0 8px #818cf8',
            display: 'inline-block'
          }} />
          <span>AI-Powered Code Reviews — Free Forever</span>
        </div>

        {/* Title Section */}
        <div style={{ marginBottom: 'clamp(2rem, 6vw, 3rem)' }}>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 7vw, 4.25rem)',
            fontWeight: '900',
            lineHeight: '1.15',
            color: '#ffffff',
            letterSpacing: '-0.03em',
            marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
          }}>
            Review any pull request <br />
            <span style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(129, 140, 248, 0.15)',
            }}>
              in seconds.
            </span>
          </h1>
          <p style={{
            fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: '1.6',
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            PRPilot integrates directly with your GitHub workflow, automatically providing 
            instant senior-developer feedback on every pull request to catch bugs, vulnerabilities, 
            and style issues before they merge.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: 'clamp(1rem, 3vw, 1.5rem)',
          marginBottom: 'clamp(3rem, 7vw, 4rem)',
        }}>
          {[
            { icon: '🐛', title: 'Bug Detection', desc: 'Catches complex logic errors and flaws before they reach production.' },
            { icon: '🔒', title: 'Security Scan', desc: 'Spots critical vulnerabilities, secrets leaks, and unsafe patterns instantly.' },
            { icon: '📊', title: 'Score & Track', desc: 'Provides detailed quality scorecards and metrics to track improvement over time.' },
          ].map((f) => (
            <div key={f.title} className="premium-feature-card" style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '16px',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'left',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>{f.icon}</div>
              <div style={{ fontWeight: '600', fontSize: 'clamp(1rem, 3vw, 1.1rem)', color: '#ffffff', marginBottom: '0.5rem' }}>{f.title}</div>
              <div style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ marginBottom: 'clamp(2rem, 6vw, 3rem)' }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '1.25rem'
          }}>
            {/* Primary CTA: Add to GitHub */}
            <a href={githubAppUrl} target="_blank" rel="noopener noreferrer" className="premium-cta-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              padding: 'clamp(0.875rem, 2vw, 1.1rem) clamp(1.75rem, 5vw, 2.25rem)',
              borderRadius: '30px',
              fontWeight: '600',
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer',
            }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Add to GitHub</span>
            </a>

            {/* Secondary CTA: Monitor Pull Requests */}
            <Link href="/api/auth/login" className="premium-secondary-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              <span>Monitor Pull Requests</span>
            </Link>
          </div>
          <p style={{
            marginTop: '1rem',
            fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
            color: 'rgba(255,255,255,0.4)',
          }}>
            Free forever · No credit card required · Open source
          </p>
        </div>

      </div>
    </main>
  )
}
