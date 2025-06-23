import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  TablePagination, Chip
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/access-logs', {
        params: {
          page: page + 1,
          limit: rowsPerPage
        }
      });
      setLogs(response.data.logs);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Failed to fetch access logs:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Riwayat Akses Gerbang
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Waktu</TableCell>
              <TableCell>UID Kartu</TableCell>
              <TableCell>Nama Pemilik</TableCell>
              <TableCell>Aksi</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                <TableCell>{log.uid || 'N/A'}</TableCell>
                <TableCell>{log.owner_name || 'Tidak Dikenal'}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  {log.granted ? (
                    <Chip 
                      icon={<CheckCircle />} 
                      label="Diizinkan" 
                      color="success" 
                      size="small" 
                    />
                  ) : (
                    <Chip 
                      icon={<Cancel />} 
                      label="Ditolak" 
                      color="error" 
                      size="small" 
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Baris per halaman:"
      />
    </Box>
  );
};

export default AccessLogs;
