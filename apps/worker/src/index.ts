import { Hono } from 'hono'

const app = new Hono()

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

export default {
  port: 3001,
  fetch: app.fetch,
}
