import { getInstallationOctokit } from './github'
import { ReviewResult } from './reviewer'

const SEVERITY_EMOJI: Record<string, string> = {
  critical: '🚨',
  high: '🔴',
  medium: '🟡',
  low: '🔵',
}

const CATEGORY_EMOJI: Record<string, string> = {
  bug: '🐛',
  security: '🔒',
  performance: '⚡',
  style: '🎨',
  logic: '🧠',
}

export async function postReviewComments(
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number,
  headSha: string,
  review: ReviewResult
) {
  const octokit = await getInstallationOctokit(installationId)

  console.log(`💬 Posting review to ${owner}/${repo}#${pullNumber}`)

  // Build inline comments for issues with line numbers
  const inlineComments = review.issues
    .filter(issue => issue.line !== null)
    .map(issue => ({
      path: issue.file,
      line: issue.line!,
      body: `${SEVERITY_EMOJI[issue.severity]} **${issue.category.toUpperCase()}** (${issue.severity})\n\n${issue.comment}\n\n**Suggestion:** ${issue.suggestion}`,
    }))

  // Build summary body
  const scoreEmoji = review.overallScore >= 80 ? '✅' : 
                     review.overallScore >= 60 ? '⚠️' : '❌'
  
  const scoreBar = buildScoreBar(review.overallScore)

  const summaryBody = `## 🤖 PRPilot Review

${scoreEmoji} **Overall Score: ${review.overallScore}/100**
${scoreBar}

### Summary
${review.summary}

### Category Scores
| Category | Score |
|----------|-------|
| 🐛 Bugs | ${review.bugScore}/100 |
| 🔒 Security | ${review.securityScore}/100 |
| ⚡ Performance | ${review.performanceScore}/100 |
| 🎨 Style | ${review.styleScore}/100 |

### Issues Found (${review.issues.length})
${review.issues.map(issue => 
  `- ${SEVERITY_EMOJI[issue.severity]} **[${issue.severity.toUpperCase()}]** ${CATEGORY_EMOJI[issue.category]} \`${issue.file}\` — ${issue.comment}`
).join('\n')}

---
*Reviewed by [PRPilot](https://github.com/Abhishek16r/PrPilot) 🤖*`

  try {
    // Post the review with inline comments
    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: headSha,
      body: summaryBody,
      event: 'COMMENT',
      comments: inlineComments.slice(0, 10), // GitHub limits inline comments
    })

    console.log(`✅ Review posted successfully`)
  } catch (error) {
    console.error('❌ Failed to post review:', error)
    
    // Fallback: post as regular comment
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body: summaryBody,
    })
    
    console.log('✅ Posted as regular comment (fallback)')
  }
}

function buildScoreBar(score: number): string {
  const filled = Math.round(score / 10)
  const empty = 10 - filled
  return '█'.repeat(filled) + '░'.repeat(empty) + ` ${score}%`
}