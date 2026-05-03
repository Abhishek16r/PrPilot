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
      background: '#0d0d14',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <NavHeader username={session.username} avatarUrl={session.avatarUrl} />

      <div style={{ padding: '24px 28px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Back button */}
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none', marginBottom: '20px',
          padding: '6px 10px', borderRadius: '6px',
          border: '0.5px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
          transition: 'all 0.15s',
        }}>
          ← Back to Dashboard
        </Link>

        {/* PR Info */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{pr.repo_name as string}</span>
            <span style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.3)' }}>
              PR #{pr.github_pr_number as number}
            </span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '6px', lineHeight: 1.3 }}>
            {pr.title as string}
          </h1>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            by {pr.author_github_login as string}
          </div>
        </div>

        {/* Score Card */}
        {review && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Overall Score
                </div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: scoreColor, lineHeight: 1 }}>
                  {score}<span style={{ fontSize: '16px', opacity: 0.5 }}>/100</span>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>
                Review Summary
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '16px' }}>
              {review.summary as string}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { label: '🐛 Bugs', score: review.bug_score as number },
                { label: '🔒 Security', score: review.security_score as number },
                { label: '⚡ Performance', score: review.performance_score as number },
                { label: '🎨 Style', score: review.style_score as number },
              ].map((cat) => (
                <div key={cat.label} style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '8px', padding: '10px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>{cat.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{cat.score ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>
              Issues Found ({comments.length})
            </span>
          </div>

          {comments.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontSize: '14px' }}>No issues — great code!</div>
            </div>
          ) : (
            comments.map((comment: any) => (
              <div key={comment.id} style={{
                padding: '14px 18px',
                borderBottom: '0.5px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: SEVERITY_BG[comment.severity] ?? 'rgba(255,255,255,0.08)',
                    color: SEVERITY_COLOR[comment.severity] ?? 'white',
                    padding: '2px 8px', borderRadius: '999px',
                    fontSize: '11px', fontWeight: '600',
                    textTransform: 'uppercase', letterSpacing: '0.03em',
                  }}>
                    {comment.severity}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {CATEGORY_EMOJI[comment.category] ?? '📝'} {comment.category}
                  </span>
                  <span style={{
                    fontSize: '11px', color: 'rgba(255,255,255,0.25)',
                    marginLeft: 'auto', fontFamily: 'monospace',
                  }}>
                    {comment.file_path}{comment.line ? `:${comment.line}` : ''}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>
                  {comment.body}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
