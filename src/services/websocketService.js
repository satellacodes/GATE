class WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {
      GATE_STATUS: [],
      NEW_ACCESS_LOG: [],
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInterval = 3000; // 3 detik
    this.token = null;
    this.isConnecting = false;
  }

  connect(token) {
    if (
      this.isConnecting ||
      (this.socket && this.socket.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.token = token;
    this.isConnecting = true;
    this.reconnectAttempts = 0;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    // Gunakan environment variable atau fallback ke window.location.host
    const backendHost =
      process.env.REACT_APP_BACKEND_URL || window.location.host;

    // Untuk IP langsung tanpa port (jika port default)
    const wsUrl = `${protocol}://${backendHost}/ws?token=${token}`;

    console.log(`Connecting to WebSocket: ${wsUrl}`);
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type && this.callbacks[message.type]) {
          this.callbacks[message.type].forEach((cb) => cb(message.data));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error, event.data);
      }
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
      this.isConnecting = false;

      if (
        event.code !== 1000 &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        console.log(`Reconnecting in ${this.reconnectInterval}ms...`);
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect(this.token);
        }, this.reconnectInterval);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.isConnecting = false;
      this.socket.close();
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, "User disconnected");
      this.socket = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Stop reconnecting
  }

  on(eventType, callback) {
    if (!this.callbacks[eventType]) {
      this.callbacks[eventType] = [];
    }
    this.callbacks[eventType].push(callback);
  }

  off(eventType, callback) {
    if (this.callbacks[eventType]) {
      this.callbacks[eventType] = this.callbacks[eventType].filter(
        (cb) => cb !== callback,
      );
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }
}

export default new WebSocketService();
