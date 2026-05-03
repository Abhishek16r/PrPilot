import { getSession } from '../../../lib/session'
import { redirect } from 'next/navigation'
import { sql } from '../../../lib/db'
import Link from 'next/link'

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
}

const SEVERITY_BG: Record<string, string> = {
  critical: 'rgba(239,68,68,0.1)',
  high: 'rgba(249,115,22,0.1)',
  medium: 'rgba(234,179,8,0.1)',
  low: 'rgba(59,130,246,0.1)',
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
    SELECT 
      pr.*,
      r.full_name as repo_name
    FROM pull_requests pr
    JOIN repos r ON pr.repo_id = r.id
    WHERE pr.id = ${id}
    LIMIT 1
  `

  if (prs.length === 0) redirect('/dashboard')
  const pr = prs[0]

  const reviews = await sql`
    SELECT * FROM reviews WHERE pr_id = ${id}
    ORDER BY created_at DESC LIMIT 1
  `

  const review = reviews[0]

  const comments = review ? await sql`
    SELECT * FROM comments WHERE review_id = ${review.id}
    ORDER BY severity DESC, created_at ASC
  ` : []

  const scoreColor = (pr.overall_score ?? 0) >= 80 ? '#4ade80' :
                     (pr.overall_score ?? 0) >= 60 ? '#facc15' : '#f87171'

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
          <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Back to Dashboard
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={session.avatarUrl} alt={session.username}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{session.username}</span>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

        {/* PR Info */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            {pr.repo_name as string} · PR #{pr.github_pr_number as number}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            {pr.title as string}
          </h1>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
            by {pr.author_github_login as string}
          </div>
        </div>

        {/* Score Card */}
        {review && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>Review Summary</h2>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: scoreColor }}>
                {pr.overall_score as number}/100
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {review.summary as string}
            </p>

            {/* Category Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {[
                { label: '🐛 Bugs', score: review.bug_score as number },
                { label: '🔒 Security', score: review.security_score as number },
                { label: '⚡ Performance', score: review.performance_score as number },
                { label: '🎨 Style', score: review.style_score as number },
              ].map((cat) => (
                <div key={cat.label} style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{cat.label}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{cat.score ?? 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues List */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>
              Issues Found ({comments.length})
            </h2>
          </div>

          {comments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <div>No issues found — great code!</div>
            </div>
          ) : (
            comments.map((comment: any) => (
              <div key={comment.id} style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <span style={{
                    background: SEVERITY_BG[comment.severity] ?? 'rgba(255,255,255,0.1)',
                    color: SEVERITY_COLOR[comment.severity] ?? 'white',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    {comment.severity}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {CATEGORY_EMOJI[comment.category] ?? '📝'} {comment.category}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#475569', marginLeft: 'auto' }}>
                    {comment.file_path}
                    {comment.line ? `:${comment.line}` : ''}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.5rem', lineHeight: 1.5 }}>
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
