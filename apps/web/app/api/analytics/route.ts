import { NextResponse } from 'next/server'
import { sql } from '../../lib/db'

export async function GET() {
  try {
    const scoreTrend = await sql`
      SELECT 
        pr.github_pr_number,
        pr.title,
        pr.overall_score,
        pr.created_at
      FROM pull_requests pr
      ORDER BY pr.created_at ASC
      LIMIT 20
    `

    const categoryAvgs = await sql`
      SELECT 
        ROUND(AVG(bug_score)) as avg_bug,
        ROUND(AVG(security_score)) as avg_security,
        ROUND(AVG(performance_score)) as avg_performance,
        ROUND(AVG(style_score)) as avg_style
      FROM reviews
    `

    const severityCounts = await sql`
      SELECT severity, COUNT(*) as count
      FROM comments
      GROUP BY severity
      ORDER BY count DESC
    `

    return NextResponse.json({
      scoreTrend,
      categoryAvgs: categoryAvgs[0] ?? {},
      severityCounts,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
