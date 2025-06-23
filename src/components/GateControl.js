import { useEffect, useState } from 'react';
import websocketService from '../services/websocketService';
import api from '../services/api';

const GateControl = () => {
  const [gateStatus, setGateStatus] = useState('loading');
  
  useEffect(() => {
    websocketService.connect();

    const unsubscribe = websocketService.on('GATE_STATUS', (message) => {
      setGateStatus(message.status);
    });

    api.get('/api/gate-status').then(response => {
      setGateStatus(response.data.status);
    });
   
    return () => unsubscribe();
  }, []);

  const controlGate = (command) => {
    api.post('/api/control-gate', { command })
      .catch(error => {
        console.error('Failed to control gate:', error);
      });
  };

  return (
    <div>
      <p>Status Gerbang: {gateStatus}</p>
      <button 
        onClick={() => controlGate('open')}
        disabled={gateStatus === 'open'}
      >
        Buka Gerbang
      </button>
      <button 
        onClick={() => controlGate('close')}
        disabled={gateStatus === 'closed'}
      >
        Tutup Gerbang
      </button>
    </div>
  );
};
