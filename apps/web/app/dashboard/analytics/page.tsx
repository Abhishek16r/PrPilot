import { getSession } from '../../lib/session'
import { redirect } from 'next/navigation'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
  const session = await getSession()
  if (!session) redirect('/')

  return (
    <AnalyticsClient
      username={session.username}
      avatarUrl={session.avatarUrl}
    />
  )
}
