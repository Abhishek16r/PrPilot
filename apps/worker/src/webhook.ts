import { Webhooks } from '@octokit/webhooks'
import { env } from './env'

export const webhooks = new Webhooks({
  secret: env.GITHUB_WEBHOOK_SECRET,
})

// Listen for PR opened or updated events
webhooks.on(['pull_request.opened', 'pull_request.synchronize', 'pull_request.reopened'], async ({ payload }) => {
  const { pull_request, repository, installation } = payload

  console.log(`📥 PR received: #${pull_request.number} "${pull_request.title}"`)
  console.log(`   Repo: ${repository.full_name}`)
  console.log(`   Author: ${pull_request.user.login}`)
  console.log(`   Head SHA: ${pull_request.head.sha}`)

  // TODO: Week 2 — queue AI review job here
})

webhooks.onError((error) => {
  console.error('Webhook error:', error)
})
