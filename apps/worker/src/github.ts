import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import { env } from './env'

const privateKey = process.env.GITHUB_PRIVATE_KEY
  ?? require('fs').readFileSync(
      require('path').resolve(process.cwd(), env.GITHUB_PRIVATE_KEY_PATH),
      'utf-8'
    )

export async function getInstallationOctokit(installationId: number) {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.GITHUB_APP_ID,
      privateKey,
      installationId,
    },
  })
  return octokit
}

export async function fetchPRDiff(
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number
) {
  const octokit = await getInstallationOctokit(installationId)

  console.log(`📡 Fetching diff for ${owner}/${repo}#${pullNumber}`)

  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  })

  console.log(`📁 Found ${files.length} changed files`)

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  })

  return { files, pr }
}