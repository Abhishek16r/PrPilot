# 🤖 PRPilot — AI Code Review Agent for GitHub

> Senior developer reviews every PR automatically. Costs $0.


**PRPilot** is an open-source GitHub App that automatically reviews every pull request using Claude AI. When a PR is opened, PRPilot fetches the diff, analyzes it for bugs, security issues, and code quality, then posts inline comments and an overall score — just like a senior developer would.

---

## ✨ Features

- 🐛 **Bug Detection** — Catches logic errors, null pointer issues, and edge cases
- 🔒 **Security Scanning** — Spots SQL injection, XSS, and other vulnerabilities
- ⚡ **Performance Review** — Identifies N+1 queries, inefficient loops, and memory leaks
- 🎨 **Style Feedback** — Enforces consistent code patterns and best practices
- 📊 **PR Scoring** — Overall score (0-100) with category breakdown
- 📈 **Analytics Dashboard** — Track code quality trends over time
- 🔄 **Async Processing** — BullMQ job queue so reviews never block webhooks
- 💾 **Review History** — All reviews persisted in PostgreSQL

---

## 🚀 Live Demo

- **Dashboard:** [pr-pilot-web.vercel.app](https://pr-pilot-web.vercel.app)
- **Worker:** [prpilotworker-production.up.railway.app](https://prpilotworker-production.up.railway.app)

---

## 🏗️ Architecture

```
GitHub PR opened
       │
       ▼
Webhook (Hono.js on Bun)
       │
       ▼
BullMQ Job Queue (Upstash Redis)
       │
       ▼
Background Worker
       │
       ├──► GitHub API (fetch diff)
       │
       ├──► Claude API (AI review)
       │
       ├──► GitHub API (post comments)
       │
       └──► Neon PostgreSQL (save results)
                   │
                   ▼
         Next.js Dashboard
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Bun | 3x faster than Node.js, native TypeScript |
| **Backend** | Hono.js | Ultrafast, edge-ready, TypeScript-first |
| **Job Queue** | BullMQ + Upstash Redis | Async processing with retries |
| **AI Engine** | Claude API (Sonnet) | Best-in-class code reasoning |
| **Database** | Neon PostgreSQL + Drizzle ORM | Serverless, type-safe queries |
| **Frontend** | Next.js 16 (App Router) | RSC, server actions, streaming |
| **Auth** | GitHub OAuth | Native GitHub integration |
| **Charts** | Recharts | Composable React charts |
| **Monorepo** | Turborepo | Shared types, parallel builds |
| **Deployment** | Railway + Vercel | Zero-config, auto-deploy |

---

## 📁 Project Structure

```
prpilot/
├── apps/
│   ├── web/                  # Next.js 16 dashboard
│   │   ├── app/
│   │   │   ├── dashboard/    # Main dashboard + analytics
│   │   │   ├── api/          # Auth + session endpoints
│   │   │   └── components/   # Shared UI components
│   └── worker/               # Bun + Hono.js backend
│       └── src/
│           ├── index.ts      # Server entry point
│           ├── webhook.ts    # GitHub webhook handler
│           ├── github.ts     # GitHub API service
│           ├── reviewer.ts   # Claude AI review engine
│           ├── processor.ts  # BullMQ job processor
│           ├── commenter.ts  # GitHub comment poster
│           ├── parser.ts     # Diff parser
│           ├── database.ts   # Database service
│           ├── queue.ts      # BullMQ queue setup
│           └── env.ts        # Zod env validation
├── packages/
│   ├── db/                   # Drizzle schema + migrations
│   ├── typescript-config/    # Shared TS config
│   └── eslint-config/        # Shared ESLint config
├── Dockerfile                # Railway deployment
└── turbo.json
```

---

## 🚦 Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Node.js](https://nodejs.org) v18+ (for some tooling)
- A [GitHub account](https://github.com)
- A [Neon](https://neon.tech) account (free)
- An [Anthropic API key](https://console.anthropic.com)
- An [Upstash](https://upstash.com) account (free)

### 1. Clone the repository

```bash
git clone https://github.com/Abhishek16r/PrPilot.git
cd PrPilot
bun install
```

### 2. Set up the database

Create a free PostgreSQL database at [neon.tech](https://neon.tech), then:

```bash
cd packages/db
cp .env.example .env
# Add your DATABASE_URL to .env
bun run db:generate
bunx drizzle-kit push
```

### 3. Create a GitHub App

1. Go to [github.com/settings/apps/new](https://github.com/settings/apps/new)
2. Set **Webhook URL** to your ngrok URL + `/webhook/github`
3. Set permissions: `Pull requests: Read & write`, `Contents: Read`
4. Subscribe to events: `Pull request`
5. Generate a private key and download the `.pem` file

### 4. Configure environment variables

```bash
cd apps/worker
cp .env.example .env
```

Fill in `apps/worker/.env`:

```env
# Database
DATABASE_URL=postgresql://...

# GitHub App
GITHUB_APP_ID=your_app_id
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_PRIVATE_KEY_PATH=./private-key.pem

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Fill in `apps/web/.env.local`:

```env
DATABASE_URL=postgresql://...
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback
SESSION_SECRET=your_random_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Start development servers

In terminal 1 (worker):
```bash
cd apps/worker
bun run dev
```

In terminal 2 (dashboard):
```bash
cd apps/web
bun run dev
```

In terminal 3 (ngrok tunnel):
```bash
ngrok http 3001
```

Update your GitHub App's webhook URL with the ngrok URL.

---

## 🌐 Deployment

### Worker → Railway

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Set root directory to `/` (uses the `Dockerfile`)
3. Add all environment variables from `apps/worker/.env`
4. For `GITHUB_PRIVATE_KEY` — convert the `.pem` file to a single line:
   ```bash
   awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' private-key.pem
   ```
5. Deploy and copy the Railway URL

### Dashboard → Vercel

1. Import your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `apps/web`
3. Add all environment variables from `apps/web/.env.local`
4. Set `NEXT_PUBLIC_APP_URL` and `GITHUB_REDIRECT_URI` to your Vercel URL
5. Deploy

### Update GitHub App

After deployment, update your GitHub App's webhook URL to:
```
https://your-railway-url.up.railway.app/webhook/github
```

---

## 📊 Database Schema

```sql
users          -- GitHub OAuth users
repos          -- Connected GitHub repositories  
pull_requests  -- PRs that have been reviewed
reviews        -- AI review results with scores
comments       -- Individual inline review comments
```

---

## 🔧 Environment Variables Reference

### Worker (`apps/worker/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `GITHUB_APP_ID` | GitHub App ID | ✅ |
| `GITHUB_CLIENT_ID` | GitHub App Client ID | ✅ |
| `GITHUB_CLIENT_SECRET` | GitHub App Client Secret | ✅ |
| `GITHUB_WEBHOOK_SECRET` | Webhook signature secret | ✅ |
| `GITHUB_PRIVATE_KEY` | PEM key content (production) | ✅ |
| `GITHUB_PRIVATE_KEY_PATH` | Path to PEM file (development) | ✅ |
| `ANTHROPIC_API_KEY` | Claude API key | ✅ |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | ✅ |

### Dashboard (`apps/web/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `GITHUB_CLIENT_ID` | GitHub App Client ID | ✅ |
| `GITHUB_CLIENT_SECRET` | GitHub App Client Secret | ✅ |
| `GITHUB_REDIRECT_URI` | OAuth callback URL | ✅ |
| `SESSION_SECRET` | Cookie signing secret (32+ chars) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Public app URL | ✅ |

---

## 💡 How It Works

1. **Install** the PRPilot GitHub App on your repository
2. **Open a PR** — GitHub sends a webhook to the worker
3. **Queue** — The webhook handler queues a review job instantly (no timeout risk)
4. **Fetch** — The worker fetches the PR diff from GitHub API
5. **Parse** — Non-reviewable files (lock files, binaries) are filtered out
6. **Review** — The diff is sent to Claude with a structured prompt
7. **Score** — An overall score (0-100) is calculated from category scores
8. **Comment** — Inline review comments are posted to the PR via GitHub API
9. **Save** — Results are persisted to PostgreSQL
10. **Dashboard** — View all reviews, scores, and trends at your dashboard URL

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request (PRPilot will review it automatically 🤖)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Built By

**Abhishek Rai** — [@Abhishek16r](https://github.com/Abhishek16r)

> Built as a portfolio project to demonstrate full-stack AI application development with modern tooling.

---

*If this project helped you, please give it a ⭐ on GitHub!*
