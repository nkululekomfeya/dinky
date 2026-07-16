import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

export default function EditDialog({ open, onClose, gauge, onUpdated }) {
  const [formData, setFormData] = useState({});

  // Populate form when dialog opens
  useEffect(() => {
    if (gauge) {
      setFormData(gauge);
    }
  }, [gauge]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleUpdate = async () => {
    await fetch(`${API_BASE}/api/gauges/${gauge.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    onClose();
    if (onUpdated) onUpdated();
  };

  if (!gauge) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Gauge</DialogTitle>

      <DialogContent>

        <TextField
          fullWidth
          label="Gauge Code"
          value={formData.gauge_code || ''}
          onChange={handleChange('gauge_code')}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description"
          value={formData.description || ''}
          onChange={handleChange('description')}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Gauge Size"
          value={formData.gauge_type || ''}
          onChange={handleChange('gauge_type')}
          margin="normal"
        />

       

        <TextField
          fullWidth
          label="Verification Type"
          value={formData.verification_type || ''}
          onChange={handleChange('verification_type')}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Base Location"
          value={formData.base_location || ''}
          onChange={handleChange('base_location')}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Calibration Frequency (Months)"
          value={formData.calibration_frequency_months || ''}
          onChange={handleChange('calibration_frequency_months')}
          margin="normal"
        />

        {/* 🔒 Disabled Field */}
        <TextField
          fullWidth
          label="Last Calibration Date"
          value={gauge.last_calibration_date || ''}
          disabled
          margin="normal"
        />

      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleUpdate}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}