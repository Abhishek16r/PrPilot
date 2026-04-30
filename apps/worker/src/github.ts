import { App } from '@octokit/app'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { env } from './env'

// Load private key from file
const privateKey = readFileSync(
  resolve(process.cwd(), env.GITHUB_PRIVATE_KEY_PATH),
  'utf-8'
)

// Initialize GitHub App
export const githubApp = new App({
  appId: env.GITHUB_APP_ID,
  privateKey,
  webhooks: {
    secret: env.GITHUB_WEBHOOK_SECRET,
  },
})

// Get an authenticated Octokit instance for a specific installation
export async function getInstallationOctokit(installationId: number) {
  return githubApp.getInstallationOctokit(installationId)
}

// Fetch the full diff for a PR
export async function fetchPRDiff(
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number
) {
  const octokit = await getInstallationOctokit(installationId)

  console.log(`📡 Fetching diff for ${owner}/${repo}#${pullNumber}`)

  // Fetch list of files changed in the PR
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  })

  console.log(`📁 Found ${files.length} changed files`)

  // Fetch PR details
  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  })

  return { files, pr }
}
