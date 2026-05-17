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
  email?: string
  avatarUrl: string
}

export default function AnalyticsClient({ username, email, avatarUrl }: Props) {
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
      background: 'linear-gradient(180deg, #0d0d14 0%, #0a0a0f 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <NavHeader
        currentPage="analytics"
        username={username}
        email={email}
        avatarUrl={avatarUrl}
      />

      <div style={{
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
            fontWeight: '700',
            marginBottom: '0.5rem',
            letterSpacing: '-0.01em',
          }}>📊 Analytics</h1>
          <p style={{
            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
            color: 'rgba(255,255,255,0.7)',
          }}>
            Track your code quality over time
          </p>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.55)',
            padding: 'clamp(2rem, 6vw, 4rem)',
          }}>
            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1rem' }}>⏳</div>
            Loading analytics...
          </div>
        ) : (
          <>
            {/* Score Trend */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '16px',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
            }}>
              <div style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                fontWeight: '600',
                marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                letterSpacing: '-0.01em',
              }}>📈 Score Trend</div>
              {trendData.length < 2 ? (
                <div style={{
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📉</div>
                  Need at least 2 reviews to show trend
                </div>
              ) : (
                <div style={{ height: 'clamp(200px, 40vw, 300px)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                      <XAxis dataKey="pr" axisLine={{ stroke: '#475569' }} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <YAxis domain={[0, 100]} axisLine={{ stroke: '#475569' }} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <Tooltip contentStyle={{
                        background: 'rgba(15,15,26,0.95)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        backdropFilter: 'blur(10px)',
                      }} labelStyle={{ color: '#f8fafc' }} itemStyle={{ color: '#e2e8f0' }} />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Charts Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 'clamp(1rem, 2vw, 1.5rem)',
            }}>
              {/* Category Scores */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 100%)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '16px',
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
              }}>
                <div style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  fontWeight: '600',
                  marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                  letterSpacing: '-0.01em',
                }}>📊 Average Category Scores</div>
                <div style={{ height: 'clamp(200px, 40vw, 280px)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                      <XAxis dataKey="name" axisLine={{ stroke: '#475569' }} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <YAxis domain={[0, 100]} axisLine={{ stroke: '#475569' }} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                      <Tooltip contentStyle={{
                        background: 'rgba(15,15,26,0.95)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        backdropFilter: 'blur(10px)',
                      }} itemStyle={{ color: '#e2e8f0' }} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        <Cell fill="#6366f1" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ec4899" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Severity Distribution */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 100%)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '16px',
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
              }}>
                <div style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  fontWeight: '600',
                  marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                  letterSpacing: '-0.01em',
                }}>🎯 Issues by Severity</div>
                {severityData.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.5)',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                    height: 'clamp(200px, 40vw, 280px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                    No data yet
                  </div>
                ) : (
                  <div style={{ height: 'clamp(200px, 40vw, 280px)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={severityData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                          {severityData.map((entry: any) => (
                            <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] ?? '#64748b'} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{
                          background: 'rgba(15,15,26,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          backdropFilter: 'blur(10px)',
                        }} />
                        <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
