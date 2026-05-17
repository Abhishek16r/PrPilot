import { getSession } from '../../../lib/session'
import { redirect } from 'next/navigation'
import { sql } from '../../../lib/db'
import Link from 'next/link'
import NavHeader from '../../../components/NavHeader'

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#f87171',
  high: '#fb923c',
  medium: '#fbbf24',
  low: '#60a5fa',
}

const SEVERITY_BG: Record<string, string> = {
  critical: 'rgba(248,113,113,0.12)',
  high: 'rgba(249,115,22,0.12)',
  medium: 'rgba(251,191,36,0.12)',
  low: 'rgba(96,165,250,0.12)',
}

const CATEGORY_EMOJI: Record<string, string> = {
  bug: '🐛',
  security: '🔒',
  performance: '⚡',
  style: '🎨',
  logic: '🧠',
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/')

  const { id } = await params

  const prs = await sql`
    SELECT pr.*, r.full_name as repo_name
    FROM pull_requests pr
    JOIN repos r ON pr.repo_id = r.id
    WHERE pr.id = ${id}
    LIMIT 1
  `

  if (prs.length === 0) redirect('/dashboard')
  const pr = prs[0]
  if (!pr) redirect('/dashboard')

  const reviews = await sql`
    SELECT * FROM reviews WHERE pr_id = ${id}
    ORDER BY created_at DESC LIMIT 1
  `
  const review = reviews[0]

  const comments = review ? await sql`
    SELECT * FROM comments WHERE review_id = ${review.id}
    ORDER BY severity DESC, created_at ASC
  ` : []

  const score = pr.overall_score as number ?? 0
  const scoreColor = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d0d14 0%, #0a0a0f 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <NavHeader username={session.username} email={session.email} avatarUrl={session.avatarUrl} />

      <div style={{
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>

        {/* Back button */}
        <Link href="/dashboard" className="back-btn" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
          color: 'rgba(255,255,255,0.85)',
          fontWeight: '500',
          textDecoration: 'none',
          marginBottom: 'clamp(1rem, 2.5vw, 1.75rem)',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid rgba(99,102,241,0.3)',
          background: 'rgba(99,102,241,0.12)',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <span>←</span> Back to Dashboard
        </Link>

        {/* PR Info */}
        <div style={{ marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>
          <div style={{
            fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
            color: 'rgba(255,255,255,0.65)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.5rem, 1vw, 1rem)',
            flexWrap: 'wrap',
          }}>
            <span>{pr.repo_name as string}</span>
            <span style={{
              background: 'rgba(99,102,241,0.2)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
              fontWeight: '600',
              color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.3)',
            }}>
              PR #{pr.github_pr_number as number}
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
            fontWeight: '700',
            marginBottom: '0.75rem',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}>
            {pr.title as string}
          </h1>
          <div style={{
            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
            color: 'rgba(255,255,255,0.55)',
          }}>
            by <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>@{pr.author_github_login as string}</span>
          </div>
        </div>

        {/* Score Card */}
        {review && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '16px',
            padding: 'clamp(1.25rem, 3vw, 1.75rem)',
            marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
            backdropFilter: 'blur(10px)',
          }}>
            <div className="responsive-score-grid" style={{
              alignItems: 'start',
              marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
            }}>
              <div>
                <div style={{
                  fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                }}>
                  Overall Score
                </div>
                <div style={{
                  fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                  fontWeight: '700',
                  color: scoreColor,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}>
                  {score}<span style={{ fontSize: 'clamp(0.9rem, 3vw, 1.5rem)', opacity: 0.55 }}>/100</span>
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                }}>
                  Review Summary
                </div>
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {review.summary as string}
                </p>
              </div>
            </div>

            {/* Category Scores */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
              gap: 'clamp(0.75rem, 1.5vw, 1rem)',
            }}>
              {[
                { label: '🐛 Bugs', score: review.bug_score as number },
                { label: '🔒 Security', score: review.security_score as number },
                { label: '⚡ Performance', score: review.performance_score as number },
                { label: '🎨 Style', score: review.style_score as number },
              ].map((cat) => {
                const score = cat.score
                const isDefined = score !== undefined && score !== null
                const catStyle = !isDefined
                  ? { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', glow: 'transparent' }
                  : score >= 80
                    ? { bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.2)', color: '#4ade80', glow: 'rgba(74,222,128,0.25)' }
                    : score >= 60
                      ? { bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24', glow: 'rgba(251,191,36,0.25)' }
                      : { bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)', color: '#f87171', glow: 'rgba(248,113,113,0.25)' }

                return (
                  <div key={cat.label} style={{
                    background: catStyle.bg,
                    borderRadius: '12px',
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    textAlign: 'center',
                    border: `1px solid ${catStyle.border}`,
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                      color: 'rgba(255,255,255,0.65)',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}>{cat.label}</div>
                    <div style={{
                      fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                      fontWeight: '700',
                      color: catStyle.color,
                      textShadow: `0 0 10px ${catStyle.glow}`,
                    }}>{cat.score ?? '—'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Issues */}
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
          }}>
            <span style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              fontWeight: '600',
              letterSpacing: '-0.01em',
            }}>
              Issues Found ({comments.length})
            </span>
          </div>

          {comments.length === 0 ? (
            <div style={{
              padding: 'clamp(2rem, 6vw, 3.5rem)',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.25)',
            }}>
              <div style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', marginBottom: '0.75rem' }}>✅</div>
              <div style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', fontWeight: '600' }}>No issues — great code!</div>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              {comments.map((comment: any, idx: number) => (
                <div key={comment.id} style={{
                  padding: 'clamp(1rem, 2vw, 1.5rem)',
                  borderBottom: idx !== comments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  <div className="comment-header-row" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    marginBottom: '0.75rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: SEVERITY_BG[comment.severity] ?? 'rgba(255,255,255,0.08)',
                        color: SEVERITY_COLOR[comment.severity] ?? 'white',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        border: `1px solid ${SEVERITY_COLOR[comment.severity] ?? 'rgba(255,255,255,0.1)'}`,
                        opacity: 0.9,
                      }}>
                        {comment.severity}
                      </span>
                      <span style={{
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                        color: 'rgba(255,255,255,0.65)',
                        fontWeight: '500',
                      }}>
                        {CATEGORY_EMOJI[comment.category] ?? '📝'} {comment.category}
                      </span>
                    </div>
                    <span className="comment-file-path" style={{
                      fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
                      color: 'rgba(255,255,255,0.55)',
                      fontFamily: 'monospace',
                      whiteSpace: 'nowrap',
                    }}>
                      {comment.file_path}{comment.line ? `:${comment.line}` : ''}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.6,
                    margin: 0,
                    wordBreak: 'break-word',
                  }}>
                    {comment.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
