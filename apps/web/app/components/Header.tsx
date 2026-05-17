import Link from 'next/link'

interface HeaderProps {
  username?: string
  avatarUrl?: string
  currentPage?: 'dashboard' | 'analytics' | 'review'
}

export default function Header({ username, avatarUrl, currentPage }: HeaderProps) {
  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: 'max(0.75rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-left), env(safe-area-inset-right))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      background: 'linear-gradient(180deg, rgba(15,15,26,0.95) 0%, rgba(15,15,26,0.85) 100%)',
      backdropFilter: 'blur(10px)',
      zIndex: 10,
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1.5rem)', flexGrow: 1, minWidth: 0 }}>
        <Link href="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: 'white',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)' }}>🤖</span>
          <span style={{ fontWeight: '700', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', letterSpacing: '-0.01em' }}>PRPilot</span>
        </Link>
        <nav style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
        }}>
          <Link href="/dashboard" style={{
            padding: '6px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
            color: currentPage === 'dashboard' ? 'white' : '#64748b',
            background: currentPage === 'dashboard' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.02)',
            fontWeight: currentPage === 'dashboard' ? '500' : '400',
            transition: 'all 0.2s ease',
            border: currentPage === 'dashboard' ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
          }}>
            Dashboard
          </Link>
          <Link href="/dashboard/analytics" style={{
            padding: '6px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
            color: currentPage === 'analytics' ? 'white' : '#64748b',
            background: currentPage === 'analytics' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.02)',
            fontWeight: currentPage === 'analytics' ? '500' : '400',
            transition: 'all 0.2s ease',
            border: currentPage === 'analytics' ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
          }}>
            Analytics
          </Link>
        </nav>
      </div>

      {username && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(0.5rem, 2vw, 1rem)',
          minWidth: 0,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
          }}>
            {avatarUrl && (
              <img src={avatarUrl} alt={username}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid rgba(99,102,241,0.3)',
                  objectFit: 'cover',
                  flexShrink: 0,
                }} />
            )}
            <span style={{
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              color: '#94a3b8',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{username}</span>
          </div>
          <Link href="/api/auth/logout" style={{
            fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
            color: '#94a3b8',
            textDecoration: 'none',
            padding: '6px 10px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            Logout
          </Link>
        </div>
      )}
    </div>
  )
}
