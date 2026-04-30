import { Webhooks } from '@octokit/webhooks'
import { env } from './env'
import { fetchPRDiff } from './github'
import { parseDiff, formatDiffForAI } from './parser'

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
  console.log(`   Repo: ${repository.full_name}`)
  console.log(`   Author: ${pull_request.user.login}`)

  if (!installation) {
    console.error('❌ No installation ID found')
    return
  }

  try {
    // Fetch the diff from GitHub
    const { files } = await fetchPRDiff(
      installation.id,
      repository.owner.login,
      repository.name,
      pull_request.number
    )

    // Parse into structured format
    const parsedDiff = parseDiff(files)

    // Format for AI
    const formattedDiff = formatDiffForAI(parsedDiff)

    console.log('\n📊 Diff Summary:')
    console.log(`   Total additions: +${parsedDiff.totalAdditions}`)
    console.log(`   Total deletions: -${parsedDiff.totalDeletions}`)
    console.log(`   Reviewable files: ${parsedDiff.reviewableFiles.length}`)
    console.log('\n📝 Formatted diff preview (first 500 chars):')
    console.log(formattedDiff.slice(0, 500))

    // TODO: Week 2 — send to AI review engine

  } catch (error) {
    console.error('❌ Error processing PR:', error)
  }
})

webhooks.onError((error) => {
  console.error('Webhook error:', error)
})
