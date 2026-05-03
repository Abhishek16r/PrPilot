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
        <nav style={{ display: 'flex', gap: '4px' }}>
          <Link href="/dashboard" style={{
            padding: '6px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            color: currentPage === 'dashboard' ? 'white' : '#64748b',
            background: currentPage === 'dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
            fontWeight: currentPage === 'dashboard' ? '500' : '400',
          }}>
            Dashboard
          </Link>
          <Link href="/dashboard/analytics" style={{
            padding: '6px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            color: currentPage === 'analytics' ? 'white' : '#64748b',
            background: currentPage === 'analytics' ? 'rgba(255,255,255,0.08)' : 'transparent',
            fontWeight: currentPage === 'analytics' ? '500' : '400',
          }}>
            Analytics
          </Link>
        </nav>
      </div>

      {username && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {avatarUrl && (
            <img src={avatarUrl} alt={username}
              style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          )}
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{username}</span>
          <Link href="/api/auth/logout" style={{
            fontSize: '0.8rem',
            color: '#475569',
            textDecoration: 'none',
            padding: '4px 10px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
          }}>
            Logout
          </Link>
        </div>
      )}
    </div>
  )
}
