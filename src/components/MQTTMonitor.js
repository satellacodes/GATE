import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const MQTTMonitor = () => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {

 const client = mqtt.connect('wss://9431ded9e69d4d53a79d71e2eeb5b834.s1.eu.hivemq.cloud:8884/mqtt', {
      username: 'ponpes-admin',
      password: 's3cur3P@ss',
      clientId: `web_${Math.random().toString(16).substr(2, 8)}`
    });

    client.on('connect', () => {
      setStatus('Connected');
      client.subscribe('ponpes/gate/status');
    });

    client.on('message', (topic, message) => {
      setMessages(prev => [
        { topic, message: message.toString(), timestamp: new Date() },
        ...prev.slice(0, 10) // Simpan 10 pesan terakhir
      ]);
    });

    client.on('error', (err) => {
      setStatus(`Error: ${err.message}`);
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div className="mqtt-monitor">
      <h3>MQTT Status: {status}</h3>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span className="timestamp">
              {msg.timestamp.toLocaleTimeString()}:
            </span>
            <span className="topic">[{msg.topic}]</span>
            <span className="content">{msg.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MQTTMonitor;

