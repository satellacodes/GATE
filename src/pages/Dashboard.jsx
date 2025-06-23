import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Box, Button, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { LockOpen, Lock } from '@mui/icons-material';

const Dashboard = () => {
  const [gateStatus, setGateStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGateStatus = async () => {
      try {
        const response = await api.get('/api/gate-status');
        setGateStatus(response.data.status);
      } catch (error) {
        console.error('Failed to fetch gate status:', error);
      }
    };

    fetchGateStatus();
    const interval = setInterval(fetchGateStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const controlGate = async (command) => {
    setLoading(true);
    try {
      await api.post('/api/control-gate', { command });
      setGateStatus(command);
    } catch (error) {
      console.error('Failed to control gate:', error);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Gerbang Ponpes
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status Gerbang
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h4" color={gateStatus === 'open' ? 'success.main' : 'error.main'}>
                  {gateStatus === 'open' ? 'TERBUKA' : 'TERTUTUP'}
                </Typography>
              </Box>
              
              <Box display="flex" gap={2} mt={3}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<LockOpen />}
                  onClick={() => controlGate('open')}
                  disabled={loading || gateStatus === 'open'}
                >
                  Buka Gerbang
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Lock />}
                  onClick={() => controlGate('close')}
                  disabled={loading || gateStatus === 'closed'}
                >
                  Tutup Gerbang
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Jadwal Gerbang
              </Typography>
              <Box>
                <Typography>06:00 - 12:00: Terbuka</Typography>
                <Typography>12:00 - 14:00: Tertutup</Typography>
                <Typography>14:00 - 18:00: Terbuka</Typography>
                <Typography>18:00 - 06:00: Tertutup</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
