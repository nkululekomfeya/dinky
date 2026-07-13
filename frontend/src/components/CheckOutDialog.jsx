import React from 'react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Stack,
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '& fieldset': { borderColor: '#e0e4ed' },
        '&:hover fieldset': { borderColor: '#b0b8cc' },
        '&.Mui-focused fieldset': { borderColor: '#1a1f2e' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1a1f2e' },
};

export default function CheckOutDialog({ open, onClose, gauge, onSuccess }) {
    const [toLocation, setToLocation] = useState('');
    const [technician, setTechnician] = useState('');
    const [partNumber, setPartNumber] = useState('');
    const [saving, setSaving] = useState(false);

    function handleSubmit() {
        setSaving(true);
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movements/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gauge_id: gauge.id,
                to_location: toLocation,
                technician,
                part_number: partNumber || null,
            }),
        })
            .then(res => { if (!res.ok) throw new Error('Checkout failed'); return res.json(); })
            .then(() => { onSuccess(); onClose(); })
            .catch(err => { console.error(err); alert('Checkout failed'); })
            .finally(() => setSaving(false));
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            onClick={e => e.stopPropagation()}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                onClick: e => e.stopPropagation(),
                elevation: 0,
                sx: {
                    borderRadius: 3,
                    border: '1.5px solid #e4e8f0',
                    overflow: 'hidden',
                }
            }}
        >
            {/* TITLE BAR */}
            <Box sx={{ bgcolor: '#1a1f2e', px: 3, py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <ExitToAppIcon sx={{ color: '#f0a500', fontSize: 20 }} />
                    <Box>
                        <Typography variant="h6" fontWeight={700} color="#fff">
                            Check Out Gauge
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9aa0b0', fontFamily: 'monospace', letterSpacing: 0.5 }}>
                            {gauge?.gauge_code}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                <Stack spacing={2}>
                    <TextField
                        label="New Location *"
                        fullWidth
                        size="small"
                        value={toLocation}
                        onChange={e => setToLocation(e.target.value)}
                        sx={fieldSx}
                    />
                    <TextField
                        label="Technician *"
                        fullWidth
                        size="small"
                        value={technician}
                        onChange={e => setTechnician(e.target.value)}
                        sx={fieldSx}
                    />
                    <TextField
                        label="Part Number (optional)"
                        fullWidth
                        size="small"
                        value={partNumber}
                        onChange={e => setPartNumber(e.target.value)}
                        sx={fieldSx}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose}
                    sx={{ color: '#9aa0b0', '&:hover': { color: '#1a1f2e', bgcolor: 'rgba(26,31,46,0.04)' } }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving || !toLocation || !technician}
                    sx={{ bgcolor: '#f0a500', color: '#1a1f2e', fontWeight: 700, boxShadow: 'none', px: 3, '&:hover': { bgcolor: '#d4920a' }, '&:disabled': { bgcolor: '#e0e4ed' } }}
                >
                    {saving ? 'Checking Out...' : 'Check Out'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}