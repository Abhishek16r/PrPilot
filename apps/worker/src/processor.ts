import { Worker, Job } from 'bullmq'
import { connection, ReviewJobData } from './queue'
import { fetchPRDiff } from './github'
import { parseDiff, formatDiffForAI } from './parser'
import { reviewDiff } from './reviewer'
import { postReviewComments } from './commenter'

export function startWorker() {
  const worker = new Worker<ReviewJobData>(
    'pr-reviews',
    async (job: Job<ReviewJobData>) => {
      const {
        installationId,
        owner,
        repo,
        pullNumber,
        prTitle,
        authorLogin,
        headSha,
      } = job.data

      console.log(`\n⚙️  Processing job ${job.id}`)
      console.log(`   PR: ${owner}/${repo}#${pullNumber}`)

      // Step 1: Fetch diff
      await job.updateProgress(10)
      const { files } = await fetchPRDiff(installationId, owner, repo, pullNumber)

      // Step 2: Parse diff
      await job.updateProgress(30)
      const parsedDiff = parseDiff(files)

      if (parsedDiff.reviewableFiles.length === 0) {
        console.log('⚠️ No reviewable files — skipping')
        return { skipped: true }
      }

      // Step 3: Format for AI
      const formattedDiff = formatDiffForAI(parsedDiff)

      // Step 4: AI Review
      await job.updateProgress(50)
      const review = await reviewDiff(formattedDiff, prTitle, `${owner}/${repo}`)

      // Step 5: Post comments to GitHub
      await job.updateProgress(80)
      await postReviewComments(
        installationId,
        owner,
        repo,
        pullNumber,
        headSha,
        review
      )

      await job.updateProgress(100)
      console.log(`✅ Job ${job.id} complete — Score: ${review.overallScore}/100`)

      return { score: review.overallScore, issueCount: review.issues.length }
    },
    {
      connection,
      concurrency: 3,
    }
  )

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`)
  })

  worker.on('failed', (job, error) => {
    console.error(`❌ Job ${job?.id} failed:`, error.message)
  })

  console.log('⚙️  Worker started — waiting for jobs...')
  return worker
}