import { getSession } from '../lib/session'
import { redirect } from 'next/navigation'
import { sql } from '../lib/db'
import Link from 'next/link'
import Header from '../components/Header'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/')

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

  const issuesCount = await sql`
    SELECT COUNT(*) as count FROM comments
  `
  const totalIssues = Number(issuesCount[0]?.count ?? 0)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <Header
        username={session.username}
        avatarUrl={session.avatarUrl}
        currentPage="dashboard"
      />

      <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
          Welcome back, {session.username} 👋
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Here's an overview of your PR reviews
        </p>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Total Reviews', value: totalReviews, icon: '📋', color: '#6366f1' },
            { label: 'Average Score', value: `${avgScore}/100`, icon: '📊', color: avgScore >= 70 ? '#22c55e' : avgScore >= 50 ? '#eab308' : '#ef4444' },
            { label: 'Issues Found', value: totalIssues, icon: '🐛', color: '#f97316' },
            { label: 'Status', value: 'Active', icon: '✅', color: '#22c55e' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem', color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Reviews */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>Recent Reviews</h2>
            <Link href="/dashboard/analytics" style={{
              fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none',
            }}>
              View Analytics →
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>No reviews yet</div>
              <div style={{ fontSize: '0.85rem' }}>Open a PR on a connected repo to get started</div>
            </div>
          ) : (
            recentReviews.map((review: any) => (
              <Link key={review.id} href={`/dashboard/reviews/${review.id}`} style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {review.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {review.repo_name} · #{review.github_pr_number} · by {review.author_github_login}
                  </div>
                </div>
                <div style={{
                  background: (review.overall_score ?? 0) >= 80 ? 'rgba(34,197,94,0.12)' :
                    (review.overall_score ?? 0) >= 60 ? 'rgba(234,179,8,0.12)' : 'rgba(239,68,68,0.12)',
                  color: (review.overall_score ?? 0) >= 80 ? '#4ade80' :
                    (review.overall_score ?? 0) >= 60 ? '#facc15' : '#f87171',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  flexShrink: 0,
                  marginLeft: '1rem',
                }}>
                  {review.overall_score ?? 'N/A'}/100
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
