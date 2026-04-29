import { pgTable, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core'

// Users table — stores GitHub OAuth users
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  githubId: text('github_id').notNull().unique(),
  username: text('username').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  accessToken: text('access_token').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Repos table — GitHub repos connected to PRPilot
export const repos = pgTable('repos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  githubRepoId: text('github_repo_id').notNull().unique(),
  fullName: text('full_name').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  defaultBranch: text('default_branch').default('main').notNull(),
  standards: text('standards'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Pull requests table
export const pullRequests = pgTable('pull_requests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  repoId: text('repo_id').notNull().references(() => repos.id, { onDelete: 'cascade' }),
  githubPrNumber: integer('github_pr_number').notNull(),
  title: text('title').notNull(),
  authorGithubLogin: text('author_github_login').notNull(),
  headSha: text('head_sha').notNull(),
  status: text('status').default('pending').notNull(),
  overallScore: integer('overall_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Reviews table — one review per PR
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  prId: text('pr_id').notNull().references(() => pullRequests.id, { onDelete: 'cascade' }),
  summary: text('summary'),
  bugScore: integer('bug_score'),
  securityScore: integer('security_score'),
  performanceScore: integer('performance_score'),
  styleScore: integer('style_score'),
  overallScore: integer('overall_score'),
  rawResponse: jsonb('raw_response'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Comments table — individual inline comments on the PR
export const comments = pgTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  reviewId: text('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  line: integer('line'),
  body: text('body').notNull(),
  category: text('category').notNull(),
  severity: text('severity').notNull(),
  githubCommentId: text('github_comment_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
