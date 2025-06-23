ass WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {
      GATE_STATUS: [],
      NEW_ACCESS_LOG: []
    };
  }

  connect() {
    if (!this.socket) {
      this.socket = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:5000');
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
      };
      
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (this.callbacks[message.type]) {
          this.callbacks[message.type].forEach(cb => cb(message));
        }
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        setTimeout(() => this.connect(), 3000);
      };
    }
  }

  on(eventType, callback) {
    if (!this.callbacks[eventType]) {
      this.callbacks[eventType] = [];
    }
    this.callbacks[eventType].push(callback);
    return () => {
      this.callbacks[eventType] = this.callbacks[eventType].filter(cb => cb !== callback);
    };
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}

export default new WebSocketService();
