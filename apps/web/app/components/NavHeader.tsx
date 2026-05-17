'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface NavHeaderProps {
  currentPage?: 'dashboard' | 'analytics'
  username?: string
  email?: string
  avatarUrl?: string
}

export default function NavHeader({ currentPage, username, email, avatarUrl }: NavHeaderProps) {
  const [imgError, setImgError] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (profileOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [profileOpen])

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', active: currentPage === 'dashboard' },
    { label: 'Analytics', href: '/dashboard/analytics', active: currentPage === 'analytics' },
  ]

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(8, 8, 16, 0.92)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <Link href="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.05rem',
          }}>
            🤖
          </div>
          <div>
            <span style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
            }}>PRPilot</span>
            <span style={{
              display: 'block',
              fontSize: '0.83rem',
              color: 'rgba(255,255,255,0.65)',
            }}>Code quality dashboard</span>
          </div>
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          flex: '1 1 auto',
          minWidth: 0,
        }}>
          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} style={{
                padding: '10px 18px',
                borderRadius: '999px',
                fontSize: '0.95rem',
                textDecoration: 'none',
                color: item.active ? '#ffffff' : 'rgba(255,255,255,0.75)',
                background: item.active ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.05)',
                fontWeight: item.active ? 600 : 500,
                border: item.active ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                whiteSpace: 'nowrap',
                minWidth: '110px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}>
                {item.label}
              </Link>
            ))}
          </div>

          <div ref={dropdownRef} style={{ position: 'relative', minWidth: 0 }}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.35rem 0.5rem',
                border: 'none',
                background: 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'right',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0, justifyContent: 'center' }}>
                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '160px',
                }}>
                  {username}
                </span>
                {email && email !== `${username}@github.com` && (
                  <span style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '160px',
                  }}>
                    {email}
                  </span>
                )}
              </div>

              {avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  onError={() => setImgError(true)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.95rem',
                  color: 'white',
                  flexShrink: 0,
                }}>
                  {username?.slice(0, 2).toUpperCase() ?? 'AB'}
                </div>
              )}
            </button>

            {profileOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 0.6rem)',
                width: '230px',
                borderRadius: '10px',
                overflow: 'hidden',
                background: 'rgba(13, 13, 18, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
                zIndex: 100,
                padding: '5px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}>
                <Link
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '10px 12px',
                    color: 'rgba(255,255,255,0.85)',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  }}
                  onClick={() => setProfileOpen(false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  View GitHub Profile
                </Link>
                <Link
                  href="/api/auth/logout"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '10px 12px',
                    color: '#f87171',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#f87171';
                  }}
                  onClick={() => setProfileOpen(false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
