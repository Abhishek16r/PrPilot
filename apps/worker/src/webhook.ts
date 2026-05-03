import { Webhooks } from '@octokit/webhooks'
import { env } from './env'
import { fetchPRDiff } from './github'
import { parseDiff, formatDiffForAI } from './parser'
import { reviewDiff } from './reviewer'

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
    // Step 1: Fetch diff
    const { files } = await fetchPRDiff(
      installation.id,
      repository.owner.login,
      repository.name,
      pull_request.number
    )

    // Step 2: Parse diff
    const parsedDiff = parseDiff(files)

    if (parsedDiff.reviewableFiles.length === 0) {
      console.log('⚠️ No reviewable files found — skipping review')
      return
    }

    // Step 3: Format for AI
    const formattedDiff = formatDiffForAI(parsedDiff)

    // Step 4: Send to Claude for review
    const review = await reviewDiff(
      formattedDiff,
      pull_request.title,
      repository.full_name
    )

    // Step 5: Log results (we'll post to GitHub in Day 6)
    console.log('\n🎯 REVIEW RESULTS:')
    console.log(`   Overall Score: ${review.overallScore}/100`)
    console.log(`   Summary: ${review.summary}`)
    console.log(`   Total Issues: ${review.issues.length}`)
    
    if (review.issues.length > 0) {
      console.log('\n   Issues found:')
      review.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.category} in ${issue.file}`)
        console.log(`      ${issue.comment}`)
      })
    }

  } catch (error) {
    console.error('❌ Error processing PR:', error)
  }
})

webhooks.onError((error) => {
  console.error('Webhook error:', error)
})