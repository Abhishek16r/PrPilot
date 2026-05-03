import { z } from 'zod'
import * as dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.string().default('3001'),
  NODE_ENV: z.string().default('development'),
  GITHUB_APP_ID: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_WEBHOOK_SECRET: z.string().min(1),
  GITHUB_PRIVATE_KEY_PATH: z.string().optional(),
  GITHUB_PRIVATE_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().min(1),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Missing environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

if (!parsed.data.GITHUB_PRIVATE_KEY && !parsed.data.GITHUB_PRIVATE_KEY_PATH) {
  console.error('❌ Either GITHUB_PRIVATE_KEY or GITHUB_PRIVATE_KEY_PATH is required')
  process.exit(1)
}

export const env = parsed.data