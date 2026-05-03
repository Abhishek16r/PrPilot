import { neon } from '@neondatabase/serverless'
import { env } from './env'
import { ReviewResult } from './reviewer'

const sql = neon(env.DATABASE_URL)

export async function saveReviewToDb(
  owner: string,
  repo: string,
  pullNumber: number,
  prTitle: string,
  authorLogin: string,
  headSha: string,
  review: ReviewResult
) {
  console.log('💾 Saving review to database...')

  try {
    const repoFullName = `${owner}/${repo}`

    // Step 1: Find or create repo record
    const existingRepo = await sql`
      SELECT id FROM repos WHERE github_repo_id = ${repoFullName} LIMIT 1
    `

    let repoId: string

    if (existingRepo.length === 0) {
      const newRepo = await sql`
        INSERT INTO repos (id, user_id, github_repo_id, full_name, is_active, default_branch)
        VALUES (gen_random_uuid(), 'system', ${repoFullName}, ${repoFullName}, true, 'main')
        RETURNING id
      `
      repoId = newRepo[0].id as string
      console.log(`📁 Created new repo record: ${repoFullName}`)
    } else {
      repoId = existingRepo[0].id as string
    }

    // Step 2: Find or create pull request record
    const existingPr = await sql`
      SELECT id FROM pull_requests
      WHERE repo_id = ${repoId} AND github_pr_number = ${pullNumber}
      LIMIT 1
    `

    let prId: string

    if (existingPr.length === 0) {
      const newPr = await sql`
        INSERT INTO pull_requests
          (id, repo_id, github_pr_number, title, author_github_login, head_sha, status, overall_score)
        VALUES
          (gen_random_uuid(), ${repoId}, ${pullNumber}, ${prTitle}, ${authorLogin}, ${headSha}, 'reviewed', ${review.overallScore})
        RETURNING id
      `
      prId = newPr[0].id as string
    } else {
      prId = existingPr[0].id as string
      await sql`
        UPDATE pull_requests
        SET status = 'reviewed', overall_score = ${review.overallScore}, updated_at = NOW()
        WHERE id = ${prId}
      `
    }

    // Step 3: Create review record
    const newReview = await sql`
      INSERT INTO reviews
        (id, pr_id, summary, bug_score, security_score, performance_score, style_score, overall_score, raw_response)
      VALUES
        (gen_random_uuid(), ${prId}, ${review.summary}, ${review.bugScore}, ${review.securityScore}, ${review.performanceScore}, ${review.styleScore}, ${review.overallScore}, ${JSON.stringify(review)})
      RETURNING id
    `
    const reviewId = newReview[0].id as string

    // Step 4: Save individual comments
    for (const issue of review.issues) {
      await sql`
        INSERT INTO comments (id, review_id, file_path, line, body, category, severity)
        VALUES (gen_random_uuid(), ${reviewId}, ${issue.file}, ${issue.line ?? null}, ${issue.comment}, ${issue.category}, ${issue.severity})
      `
    }

    console.log(`✅ Review saved — PR: ${prId}, Review: ${reviewId}`)
    return { prId, reviewId }

  } catch (error) {
    console.error('❌ Failed to save to database:', error)
    throw error
  }
}