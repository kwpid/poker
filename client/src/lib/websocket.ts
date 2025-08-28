export class GameWebSocket {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: { [key: string]: Function[] } = {};

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    // Construct WebSocket URL - handle both development and production environments
    let wsUrl;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    
    // Check if we're in a Replit environment or if port is defined
    if (window.location.port && window.location.port !== '80' && window.location.port !== '443') {
      // Development environment with explicit port
      wsUrl = `${protocol}//${window.location.hostname}:${window.location.port}/ws`;
    } else {
      // Production environment or default ports
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }
    
    console.log('Attempting WebSocket connection to:', wsUrl);
    
    try {
      this.socket = new WebSocket(wsUrl);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      // Try fallback connection after a delay
      setTimeout(() => this.attemptReconnect(), 1000);
      return;
    }

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  send(type: string, payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected. Message not sent:', { type, payload });
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

export const gameSocket = new GameWebSocket();
