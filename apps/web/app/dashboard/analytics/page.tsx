'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts'

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const categoryData = data ? [
    { name: 'Bugs', score: Number(data.categoryAvgs.avg_bug ?? 0) },
    { name: 'Security', score: Number(data.categoryAvgs.avg_security ?? 0) },
    { name: 'Performance', score: Number(data.categoryAvgs.avg_performance ?? 0) },
    { name: 'Style', score: Number(data.categoryAvgs.avg_style ?? 0) },
  ] : []

  const severityData = data?.severityCounts?.map((s: any) => ({
    name: s.severity,
    value: Number(s.count),
  })) ?? []

  const trendData = data?.scoreTrend?.map((pr: any) => ({
    pr: `#${pr.github_pr_number}`,
    score: pr.overall_score ?? 0,
  })) ?? []

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>PRPilot</span>
          <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
            Dashboard
          </Link>
          <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>Analytics</span>
        </div>
        <Link href="/api/auth/logout" style={{
          fontSize: '0.8rem', color: '#475569', textDecoration: 'none',
          padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
        }}>
          Logout
        </Link>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>
          Analytics
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Track your code quality over time
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '4rem' }}>
            Loading analytics...
          </div>
        ) : (
          <>
            {/* Score Trend */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                📈 Score Trend
              </h2>
              {trendData.length < 2 ? (
                <div style={{ textAlign: 'center', color: '#475569', padding: '2rem' }}>
                  Need at least 2 reviews to show trend
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="pr" stroke="#475569" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#475569" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: '#6366f1', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category Scores + Severity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

              {/* Category Bar Chart */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '1.5rem',
              }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                  📊 Average Category Scores
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#475569" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      <Cell fill="#6366f1" />
                      <Cell fill="#22c55e" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ec4899" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Severity Pie Chart */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '1.5rem',
              }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                  🎯 Issues by Severity
                </h2>
                {severityData.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#475569', padding: '2rem' }}>
                    No issues data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {severityData.map((entry: any) => (
                          <Cell
                            key={entry.name}
                            fill={SEVERITY_COLORS[entry.name] ?? '#64748b'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Legend
                        formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}
