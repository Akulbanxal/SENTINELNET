import { createServer } from 'http'
import { WebSocketServer } from 'ws'

let wss: WebSocketServer | null = null

export function initWebSocket(server: ReturnType<typeof createServer>) {
  if (wss) return
  wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection')

    ws.on('message', (message) => {
      // keep terminal logs minimal; forward incoming messages for debugging
      console.log('WS Received:', message.toString())
    })

    ws.on('close', () => {
      console.log('WebSocket connection closed')
    })

    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to SentinelNet WebSocket' }))
  })
}

export function broadcast(event: any) {
  if (!wss) return
  const payload = JSON.stringify(event)
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload)
    }
  })
}

export default { initWebSocket, broadcast }
