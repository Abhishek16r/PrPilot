import { Queue, Worker, Job } from 'bullmq'
import { Redis } from 'ioredis'
import { env } from './env'

// BullMQ needs ioredis for TCP connection
// We parse the Upstash URL to get connection details
const redisUrl = new URL(env.UPSTASH_REDIS_REST_URL)

export const connection = new Redis({
  host: redisUrl.hostname,
  port: 6379,
  password: env.UPSTASH_REDIS_REST_TOKEN,
  tls: {},
  maxRetriesPerRequest: null,
})

// Define the job data structure
export interface ReviewJobData {
  installationId: number
  owner: string
  repo: string
  pullNumber: number
  prTitle: string
  authorLogin: string
  headSha: string
}

// Create the queue
export const reviewQueue = new Queue<ReviewJobData>('pr-reviews', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})

console.log('✅ Review queue initialized')