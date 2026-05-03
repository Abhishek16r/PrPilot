'use client'

import Link from 'next/link'

interface NavHeaderProps {
  currentPage?: 'dashboard' | 'analytics'
}

export default function NavHeader({ currentPage }: NavHeaderProps) {
  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      background: '#0f0f1a',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white' }}>
          <span style={{ fontSize: '1.4rem' }}>🤖</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>PRPilot</span>
        </Link>
        <Link href="/dashboard" style={{
          padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem',
          color: currentPage === 'dashboard' ? 'white' : '#64748b',
          background: currentPage === 'dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
          fontWeight: currentPage === 'dashboard' ? '500' : '400',
        }}>
          Dashboard
        </Link>
        <Link href="/dashboard/analytics" style={{
          padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem',
          color: currentPage === 'analytics' ? 'white' : '#64748b',
          background: currentPage === 'analytics' ? 'rgba(255,255,255,0.08)' : 'transparent',
          fontWeight: currentPage === 'analytics' ? '500' : '400',
        }}>
          Analytics
        </Link>
      </div>
      <Link href="/api/auth/logout" style={{
        fontSize: '0.8rem', color: '#475569', textDecoration: 'none',
        padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
      }}>
        Logout
      </Link>
    </div>
  )
}
