import { App } from '@octokit/app'
import { Octokit } from '@octokit/rest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { env } from './env'

const privateKey = readFileSync(
  resolve(process.cwd(), env.GITHUB_PRIVATE_KEY_PATH),
  'utf-8'
)

export const githubApp = new App({
  appId: env.GITHUB_APP_ID,
  privateKey,
  webhooks: {
    secret: env.GITHUB_WEBHOOK_SECRET,
  },
})

export async function getInstallationOctokit(installationId: number) {
  const response = await githubApp.octokit.rest.apps.createInstallationAccessToken({
    installation_id: installationId,
  })
  return new Octokit({ auth: response.data.token })
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