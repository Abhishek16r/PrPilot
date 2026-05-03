import { getSession } from '../lib/session'
import { redirect } from 'next/navigation'
import { sql } from '../lib/db'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/')
  }

  // Fetch recent reviews from DB
  const recentReviews = await sql`
    SELECT 
      pr.id,
      pr.github_pr_number,
      pr.title,
      pr.author_github_login,
      pr.overall_score,
      pr.status,
      pr.created_at,
      r.full_name as repo_name
    FROM pull_requests pr
    JOIN repos r ON pr.repo_id = r.id
    ORDER BY pr.created_at DESC
    LIMIT 10
  `

  const totalReviews = recentReviews.length
  const avgScore = totalReviews > 0
    ? Math.round(recentReviews.reduce((sum: number, r: any) => sum + (r.overall_score ?? 0), 0) / totalReviews)
    : 0

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>PRPilot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={session.avatarUrl}
            alt={session.username}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{session.username}</span>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Welcome */}
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
          Welcome back, {session.username} 👋
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Here's an overview of your PR reviews
        </p>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Total Reviews', value: totalReviews, icon: '📋' },
            { label: 'Average Score', value: `${avgScore}/100`, icon: '📊' },
            { label: 'Status', value: 'Active', icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>{stat.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Reviews */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>Recent Reviews</h2>
          </div>

          {recentReviews.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <div>No reviews yet — open a PR to get started!</div>
            </div>
          ) : (
            recentReviews.map((review: any) => (
              <div key={review.id} style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                    {review.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {review.repo_name} · #{review.github_pr_number} · by {review.author_github_login}
                  </div>
                </div>
                <div style={{
                  background: (review.overall_score ?? 0) >= 80 ? 'rgba(34,197,94,0.15)' :
                               (review.overall_score ?? 0) >= 60 ? 'rgba(234,179,8,0.15)' :
                               'rgba(239,68,68,0.15)',
                  color: (review.overall_score ?? 0) >= 80 ? '#4ade80' :
                         (review.overall_score ?? 0) >= 60 ? '#facc15' : '#f87171',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                }}>
                  {review.overall_score ?? 'N/A'}/100
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
