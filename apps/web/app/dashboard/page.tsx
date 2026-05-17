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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0d0d14 0%, #0a0a0f 100%)', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <NavHeader currentPage="dashboard" username={session.username} email={session.email} avatarUrl={session.avatarUrl} />

      <div style={{
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
            fontWeight: '700',
            marginBottom: '0.5rem',
            letterSpacing: '-0.01em',
          }}>
            Welcome back, {session.username} 👋
          </h1>
          <p style={{
            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
            color: 'rgba(255,255,255,0.7)',
          }}>
            Here's your code quality overview
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
        }}>
          {[
            { label: 'Total Reviews', value: totalReviews, sub: 'all time', color: '#818cf8', icon: '📋' },
            { label: 'Average Score', value: `${avgScore}/100`, sub: avgScore > 0 ? '↑ improving' : 'no data yet', color: scoreColor, icon: '📊' },
            { label: 'Issues Found', value: totalIssues, sub: 'across all PRs', color: '#fb923c', icon: '⚠️' },
            { label: 'Active Repos', value: totalRepos, sub: 'connected', color: '#2dd4bf', icon: '📚' },
          ].map((stat) => (
            <div key={stat.label} className="hover-card-soft" style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '16px',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '140px',
            }}>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{
                fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                color: 'rgba(255,255,255,0.75)',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600',
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
                fontWeight: '700',
                color: stat.color,
                marginBottom: '0.5rem',
                letterSpacing: '-0.01em',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                color: 'rgba(255,255,255,0.55)',
                marginTop: 'auto',
              }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Recent Reviews Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            padding: 'clamp(1rem, 2vw, 1.5rem)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <span style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              fontWeight: '600',
              letterSpacing: '-0.01em',
            }}>Recent Reviews</span>
            <Link href="/dashboard/analytics" className="hover-link-float" style={{
              fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
              color: '#818cf8',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              fontWeight: '500',
            }}>
              View Analytics →
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div style={{
              padding: 'clamp(2rem, 6vw, 4rem)',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
            }}>
              <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '1rem' }}>🔍</div>
              <div style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                fontWeight: '600',
                marginBottom: '0.5rem',
                letterSpacing: '-0.01em',
              }}>No reviews yet</div>
              <div style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', color: 'rgba(255,255,255,0.4)' }}>Open a PR on a connected repo to get started</div>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              {recentReviews.map((review: any, idx: number) => {
                const score = review.overall_score ?? 0
                const scoreStyle = score >= 80
                  ? { bg: 'rgba(74,222,128,0.12)', color: '#4ade80' }
                  : score >= 60
                    ? { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' }
                    : { bg: 'rgba(248,113,113,0.12)', color: '#f87171' }

                return (
                  <Link key={review.id} href={`/dashboard/reviews/${review.id}`} className="hover-row" style={{
                    padding: 'clamp(0.875rem, 2vw, 1.25rem)',
                    borderBottom: idx !== recentReviews.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(0.75rem, 2vw, 1.25rem)',
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                      fontWeight: '700',
                      color: 'rgba(255,255,255,0.85)',
                      background: 'rgba(99,102,241,0.2)',
                      border: '1px solid rgba(99,102,241,0.4)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      flexShrink: 0,
                      letterSpacing: '0.05em',
                    }}>
                      #{review.github_pr_number}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row-title" style={{
                        fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                        color: 'rgba(255,255,255,0.9)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '0.25rem',
                        fontWeight: '500',
                        letterSpacing: '-0.01em',
                        transition: 'color 0.2s ease',
                      }}>
                        {review.title}
                      </div>
                      <div className="row-meta" style={{
                        fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                        color: 'rgba(255,255,255,0.35)',
                        transition: 'color 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}>
                        <span className="row-repo" style={{
                          color: 'rgba(255,255,255,0.7)',
                          fontWeight: '500',
                          transition: 'color 0.2s ease',
                        }}>
                          {review.repo_name}
                        </span>
                        <span className="row-sep" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s ease' }}>·</span>
                        <span className="row-by" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s ease' }}>by</span>
                        <span className="row-author" style={{
                          color: 'rgba(255,255,255,0.55)',
                          fontWeight: '500',
                          transition: 'color 0.2s ease',
                        }}>
                          @{review.author_github_login}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
                      fontWeight: '700',
                      flexShrink: 0,
                      background: scoreStyle.bg,
                      color: scoreStyle.color,
                      whiteSpace: 'nowrap',
                    }}>
                      {score}/100
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
