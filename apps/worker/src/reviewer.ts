import Anthropic from '@anthropic-ai/sdk'
import { env } from './env'

const client = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert code reviewer with 15+ years of experience.
You review pull request diffs and provide structured, actionable feedback.

Your review must be returned as valid JSON only — no markdown, no explanation outside the JSON.

For each issue you find, classify it as:
- category: "bug" | "security" | "performance" | "style" | "logic"
- severity: "critical" | "high" | "medium" | "low"

Scoring rubric (0-100):
- Start at 100
- Critical issue: -20 points each
- High issue: -10 points each
- Medium issue: -5 points each
- Low issue: -2 points each
- Minimum score is 0

Be specific — reference exact file names and line numbers from the diff.
Only report real issues — do not invent problems that don't exist.
Focus on bugs, security vulnerabilities, and logic errors first.`

export interface ReviewIssue {
  file: string
  line: number | null
  category: 'bug' | 'security' | 'performance' | 'style' | 'logic'
  severity: 'critical' | 'high' | 'medium' | 'low'
  comment: string
  suggestion: string
}

export interface ReviewResult {
  overallScore: number
  summary: string
  issues: ReviewIssue[]
  bugScore: number
  securityScore: number
  performanceScore: number
  styleScore: number
}

// Max tokens to send to Claude — prevents context window overflow
const MAX_DIFF_CHARS = 80000

// Retry with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) throw error
      console.log(`⚠️ Attempt ${attempt} failed, retrying in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
    }
  }
  throw new Error('Max retries exceeded')
}

export async function reviewDiff(
  formattedDiff: string,
  prTitle: string,
  repoName: string
): Promise<ReviewResult> {
  console.log('🤖 Sending diff to Claude for review...')

  // Truncate diff if too large
  const truncatedDiff = formattedDiff.length > MAX_DIFF_CHARS
    ? formattedDiff.slice(0, MAX_DIFF_CHARS) + '\n\n[Diff truncated due to size]'
    : formattedDiff

  if (formattedDiff.length > MAX_DIFF_CHARS) {
    console.log(`⚠️ Diff truncated from ${formattedDiff.length} to ${MAX_DIFF_CHARS} chars`)
  }

  const prompt = `Review this pull request:

Repository: ${repoName}
PR Title: ${prTitle}

Code changes:
${truncatedDiff}

Return a JSON object with exactly this structure:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence summary of the PR quality>",
  "issues": [
    {
      "file": "<filename>",
      "line": <line number or null>,
      "category": "<bug|security|performance|style|logic>",
      "severity": "<critical|high|medium|low>",
      "comment": "<what the issue is>",
      "suggestion": "<how to fix it>"
    }
  ],
  "bugScore": <number 0-100>,
  "securityScore": <number 0-100>,
  "performanceScore": <number 0-100>,
  "styleScore": <number 0-100>
}`

  const message = await withRetry(() =>
    client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      system: SYSTEM_PROMPT,
    })
  )

  // Extract text from response
  const responseText = message.content
    .filter(block => block.type === 'text')
    .map(block => block.type === 'text' ? block.text : '')
    .join('')

  console.log('✅ Claude response received')

  // Parse JSON response
  try {
    // Remove any markdown code blocks if present
    const cleanJson = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const result = JSON.parse(cleanJson) as ReviewResult

    // Validate required fields
    if (typeof result.overallScore !== 'number') {
      throw new Error('Invalid response: missing overallScore')
    }
    if (!Array.isArray(result.issues)) {
      throw new Error('Invalid response: missing issues array')
    }

    console.log(`📊 Review complete — Score: ${result.overallScore}/100`)
    console.log(`   Issues found: ${result.issues.length}`)

    return result
  } catch (error) {
    console.error('❌ Failed to parse Claude response')
    throw new Error(`Failed to parse AI review response: ${error}`)
  }
}