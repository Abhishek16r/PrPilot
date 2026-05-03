'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts'
import NavHeader from '../../components/NavHeader'

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
}

interface Props {
  username: string
  avatarUrl: string
}

export default function AnalyticsClient({ username, avatarUrl }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
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
      background: '#0d0d14',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <NavHeader
        currentPage="analytics"
        username={username}
        avatarUrl={avatarUrl}
      />

      <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Analytics</h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '24px' }}>
          Track your code quality over time
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '4rem' }}>
            Loading analytics...
          </div>
        ) : (
          <>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '16px' }}>📈 Score Trend</div>
              {trendData.length < 2 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '2rem' }}>
                  Need at least 2 reviews to show trend
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="pr" stroke="#475569" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#475569" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} labelStyle={{ color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '16px' }}>📊 Average Category Scores</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#475569" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      <Cell fill="#6366f1" />
                      <Cell fill="#22c55e" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ec4899" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '16px' }}>🎯 Issues by Severity</div>
                {severityData.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '2rem' }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {severityData.map((entry: any) => (
                          <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] ?? '#64748b'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                      <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>} />
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
