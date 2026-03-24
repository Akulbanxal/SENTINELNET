type EventHandler = (payload: any) => void

class WSClient {
  private ws: WebSocket | null = null
  private handlers: Record<string, EventHandler[]> = {}

  connect(url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace('http', 'ws')) {
    const wsUrl = url.replace(/^http/, 'ws') + '/'
    this.ws = new WebSocket(wsUrl)
    this.ws.onopen = () => console.log('WS connected')
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        const handlers = this.handlers[msg.type] || []
        handlers.forEach(h => h(msg.data))
      } catch (e) {
        console.warn('WS parse error', e)
      }
    }
    this.ws.onclose = () => console.log('WS closed')
  }

  on(type: string, handler: EventHandler) {
    this.handlers[type] = this.handlers[type] || []
    this.handlers[type].push(handler)
  }

  off(type: string, handler: EventHandler) {
    const list = this.handlers[type]
    if (!list) return
    this.handlers[type] = list.filter((h) => h !== handler)
  }

  send(type: string, data: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify({ type, data }))
  }

  close() {
    if (this.ws) {
      try {
        this.ws.close()
      } catch (e) {
        console.warn('WS close error', e)
      }
    }
    this.ws = null
    this.handlers = {}
  }
}

export const wsClient = new WSClient()
