import { Hono } from 'hono'
import { env } from './env'
import { webhooks } from './webhook'

const app = new Hono()

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'PRPilot worker is running',
    version: '0.0.1'
  })
})

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// GitHub webhook receiver
app.post('/webhook/github', async (c) => {
  const signature = c.req.header('x-hub-signature-256')
  const event = c.req.header('x-github-event')
  const body = await c.req.text()

  if (!signature || !event) {
    return c.json({ error: 'Missing headers' }, 400)
  }

  try {
    await webhooks.verifyAndReceive({
      id: c.req.header('x-github-delivery') ?? '',
      name: event as any,
      signature,
      payload: body,
    })

    return c.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook verification failed:', error)
    return c.json({ error: 'Invalid webhook signature' }, 401)
  }
})

console.log(`🚀 PRPilot worker running on port ${env.PORT}`)

export default {
  port: parseInt(env.PORT),
  fetch: app.fetch,
}
// webhook test
// diff fetch test
// test 3
// test 4
// test 5
// test 6
