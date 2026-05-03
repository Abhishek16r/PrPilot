'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NavHeaderProps {
  currentPage?: 'dashboard' | 'analytics'
  username?: string
  avatarUrl?: string
}

export default function NavHeader({ currentPage, username, avatarUrl }: NavHeaderProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <nav style={{
      background: '#0d0d14',
      borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      padding: '0 24px',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '14px', flexShrink: 0,
          }}>🤖</div>
          <span style={{ fontSize: '15px', fontWeight: '600', color: 'white', letterSpacing: '-0.01em' }}>PRPilot</span>
        </Link>
        <div style={{ display: 'flex', gap: '2px' }}>
          {['dashboard', 'analytics'].map((page) => (
            <Link key={page} href={page === 'dashboard' ? '/dashboard' : '/dashboard/analytics'} style={{
              padding: '5px 12px', borderRadius: '6px', fontSize: '13px',
              textDecoration: 'none',
              color: currentPage === page ? 'white' : 'rgba(255,255,255,0.4)',
              background: currentPage === page ? 'rgba(255,255,255,0.09)' : 'transparent',
              fontWeight: currentPage === page ? '500' : '400',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}>
              {page}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={username}
            onError={() => setImgError(true)}
            style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '600', color: 'white',
          }}>
            {username?.slice(0, 2).toUpperCase() ?? 'AB'}
          </div>
        )}
        {username && (
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {username}
          </span>
        )}
        <Link href="/api/auth/logout" style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.35)',
          textDecoration: 'none', padding: '4px 10px',
          border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
            ;(e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.35)'
            ;(e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
          }}
        >
          Logout
        </Link>
      </div>
    </nav>
  )
}
