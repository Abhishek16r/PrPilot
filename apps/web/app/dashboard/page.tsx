import { getSession } from '../lib/session'
import { redirect } from 'next/navigation'
import { sql } from '../lib/db'
import Link from 'next/link'
import NavHeader from '../components/NavHeader'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/')

  const recentReviews = await sql`
    SELECT 
      pr.id, pr.github_pr_number, pr.title,
      pr.author_github_login, pr.overall_score,
      pr.created_at, r.full_name as repo_name
    FROM pull_requests pr
    JOIN repos r ON pr.repo_id = r.id
    ORDER BY pr.created_at DESC
    LIMIT 10
  `

  const totalReviews = recentReviews.length
  const avgScore = totalReviews > 0
    ? Math.round(recentReviews.reduce((sum: number, r: any) => sum + (r.overall_score ?? 0), 0) / totalReviews)
    : 0

  const issuesCount = await sql`SELECT COUNT(*) as count FROM comments`
  const totalIssues = Number(issuesCount[0]?.count ?? 0)

  const reposCount = await sql`SELECT COUNT(*) as count FROM repos WHERE is_active = true`
  const totalRepos = Number(reposCount[0]?.count ?? 0)

  const scoreColor = avgScore >= 80 ? '#4ade80' : avgScore >= 60 ? '#fbbf24' : '#f87171'

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d14', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <NavHeader currentPage="dashboard" username={session.username} avatarUrl={session.avatarUrl} />

      <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
          Welcome back, {session.username} 👋
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '24px' }}>
          Here's your code quality overview
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Reviews', value: totalReviews, sub: 'all time', color: '#818cf8' },
            { label: 'Average Score', value: `${avgScore}/100`, sub: avgScore > 0 ? '↑ improving' : 'no data yet', color: scoreColor },
            { label: 'Issues Found', value: totalIssues, sub: 'across all PRs', color: '#fb923c' },
            { label: 'Active Repos', value: totalRepos, sub: 'connected', color: '#2dd4bf' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: stat.color, marginBottom: '2px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Recent Reviews */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Recent Reviews</span>
            <Link href="/dashboard/analytics" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none' }}>
              View Analytics →
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>No reviews yet</div>
              <div style={{ fontSize: '12px' }}>Open a PR on a connected repo to get started</div>
            </div>
          ) : (
            recentReviews.map((review: any) => {
              const score = review.overall_score ?? 0
              const scoreStyle = score >= 80
                ? { bg: 'rgba(74,222,128,0.12)', color: '#4ade80' }
                : score >= 60
                  ? { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' }
                  : { bg: 'rgba(248,113,113,0.12)', color: '#f87171' }

              return (
                <Link key={review.id} href={`/dashboard/reviews/${review.id}`} style={{
                  padding: '12px 18px',
                  borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '600',
                    color: 'rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.06)',
                    padding: '2px 7px', borderRadius: '4px', flexShrink: 0,
                  }}>
                    #{review.github_pr_number}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                      {review.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                      {review.repo_name} · by {review.author_github_login}
                    </div>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: '999px',
                    fontSize: '12px', fontWeight: '600', flexShrink: 0,
                    background: scoreStyle.bg, color: scoreStyle.color,
                  }}>
                    {score}/100
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
