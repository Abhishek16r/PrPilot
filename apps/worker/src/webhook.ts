import { Webhooks } from '@octokit/webhooks'
import { env } from './env'
import { reviewQueue } from './queue'

export const webhooks = new Webhooks({
  secret: env.GITHUB_WEBHOOK_SECRET,
})

webhooks.on([
  'pull_request.opened',
  'pull_request.synchronize',
  'pull_request.reopened'
], async ({ payload }) => {
  const { pull_request, repository, installation } = payload

  console.log(`\n📥 PR received: #${pull_request.number} "${pull_request.title}"`)

  if (!installation) {
    console.error('❌ No installation ID found')
    return
  }

  // Queue the review job — webhook returns instantly
  const job = await reviewQueue.add('review-pr', {
    installationId: installation.id,
    owner: repository.owner.login,
    repo: repository.name,
    pullNumber: pull_request.number,
    prTitle: pull_request.title,
    authorLogin: pull_request.user?.login ?? 'unknown',
    headSha: pull_request.head.sha,
  })

  console.log(`📋 Review job queued — ID: ${job.id}`)
})

webhooks.onError((error) => {
  console.error('Webhook error:', error)
})