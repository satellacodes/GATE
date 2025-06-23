import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Box, Button, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Snackbar, Alert
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const RfidCards = () => {
  const [cards, setCards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCard, setNewCard] = useState({ uid: '', ownerName: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await api.get('/api/rfid-cards');
      setCards(response.data);
    } catch (error) {
      console.error('Failed to fetch RFID cards:', error);
      showSnackbar('Gagal memuat data kartu', 'error');
    }
  };

  const handleCreateCard = async () => {
    try {
      await api.post('/api/rfid-cards', {
        uid: newCard.uid,
        ownerName: newCard.ownerName
      });
      fetchCards();
      setOpenDialog(false);
      setNewCard({ uid: '', ownerName: '' });
      showSnackbar('Kartu berhasil ditambahkan', 'success');
    } catch (error) {
      console.error('Failed to create RFID card:', error);
      showSnackbar('Gagal menambahkan kartu', 'error');
    }
  };

  const handleDeleteCard = async (id) => {
    try {
      await api.delete(`/api/rfid-cards/${id}`);
      fetchCards();
      showSnackbar('Kartu berhasil dihapus', 'success');
    } catch (error) {
      console.error('Failed to delete RFID card:', error);
      showSnackbar('Gagal menghapus kartu', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Manajemen Kartu RFID</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Tambah Kartu
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>UID</TableCell>
              <TableCell>Nama Pemilik</TableCell>
              <TableCell>Tanggal Dibuat</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card.id}>
                <TableCell>{card.uid}</TableCell>
                <TableCell>{card.owner_name}</TableCell>
                <TableCell>{new Date(card.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteCard(card.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Tambah Kartu */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Tambah Kartu RFID Baru</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="UID Kartu"
            fullWidth
            variant="standard"
            value={newCard.uid}
            onChange={(e) => setNewCard({...newCard, uid: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Nama Pemilik"
            fullWidth
            variant="standard"
            value={newCard.ownerName}
            onChange={(e) => setNewCard({...newCard, ownerName: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Batal</Button>
          <Button onClick={handleCreateCard} variant="contained">Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifikasi */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RfidCards;
