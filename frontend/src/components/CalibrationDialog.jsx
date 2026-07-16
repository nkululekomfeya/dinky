import React from 'react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    MenuItem,
    TextField,
    Typography,
    Box,
    Stack,
    Chip,
    Divider,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import VerifiedIcon from '@mui/icons-material/Verified';
import UploadFileIcon from '@mui/icons-material/UploadFile';


const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '& fieldset': { borderColor: '#e0e4ed' },
        '&:hover fieldset': { borderColor: '#b0b8cc' },
        '&.Mui-focused fieldset': { borderColor: '#1a1f2e' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1a1f2e' },
};

export default function CalibrationDialog({ open, onClose, gaugeId, gaugeType, onSuccess }) {
    const isInternal = gaugeType === 'INTERNAL';
    const isExternal = gaugeType === 'EXTERNAL';
    const [gauge, setGauge] = useState(null);
    const [calibrationDate, setCalibrationDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [result, setResult] = useState('');
    const [performedBy, setPerformedBy] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);
    const [masterGaugeNumber, setMasterGaugeNumber] = useState('');
    const [calibrationSteps, setCalibrationSteps] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !gaugeId) return;

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gauges/${gaugeId}`)
            .then(res => res.json())
            .then(data => {
                setGauge(data.gauge);
            })
            .catch(err => {
                console.error('Failed to fetch gauge:', err);
            });

    }, [open, gaugeId]);

    
    useEffect(() => {
        if (!calibrationDate || !gauge?.calibration_frequency_months) return;

        const date = new Date(calibrationDate);
        date.setMonth(date.getMonth() + gauge.calibration_frequency_months);

        // format as YYYY-MM-DD for the date input
        const formatted = date.toISOString().split('T')[0];
        setDueDate(formatted);
    }, [calibrationDate, gauge]);

    const handleSubmit = async () => {
        if (!calibrationDate || !performedBy) {
            alert('Please fill required fields');
            return;
        }
        if (isInternal && (!masterGaugeNumber || !calibrationSteps)) {
            alert('Internal calibration requires master gauge and steps');
            return;
        }

        const formData = new FormData();
        formData.append('calibration_date', calibrationDate);
        formData.append('due_date', dueDate);
        formData.append('result', result);
        formData.append('performed_by', performedBy);
        formData.append('notes', notes);
        if (isExternal && file) formData.append('certificate', file);
        if (isInternal) {
            formData.append('master_gauge_number', masterGaugeNumber);
            const stepsArray = calibrationSteps.split('\n').map(l => l.trim()).filter(Boolean);
            formData.append('calibration_steps', JSON.stringify(stepsArray));
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/calibrations/${gaugeId}`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Failed to save calibration');

            // update the gauge dates
            const gaugeUpdateRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gauges/${gaugeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    last_calibration_date: calibrationDate,
                    next_calibration_date: dueDate,
                }),
            });
            if (!gaugeUpdateRes.ok) throw new Error('Failed to update gauge dates');

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Calibration save error message:', err.message);
            console.error('Calibration save error stack:', err.stack);
            alert('Calibration save failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{
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
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <VerifiedIcon sx={{ color: '#f0a500', fontSize: 20 }} />
                        <Typography variant="h6" fontWeight={700} color="#fff">
                            Add Calibration
                        </Typography>
                    </Stack>
                    <Chip
                        label={isInternal ? 'Internal' : 'External'}
                        size="small"
                        sx={{
                            bgcolor: isInternal ? 'rgba(46,204,113,0.15)' : 'rgba(240,165,0,0.15)',
                            color: isInternal ? '#2ecc71' : '#f0a500',
                            border: `1px solid ${isInternal ? 'rgba(46,204,113,0.3)' : 'rgba(240,165,0,0.3)'}`,
                            fontWeight: 700,
                            fontSize: '0.72rem',
                        }}
                    />
                </Stack>
            </Box>

            <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                <Stack spacing={2}>

                    {/* DATES */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            label="Calibration Date *"
                            type="date"
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={calibrationDate}
                            onChange={e => setCalibrationDate(e.target.value)}
                            sx={fieldSx}
                        />
                        <TextField
                            label="Due Date (auto-calculated)"
                            type="date"
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={dueDate}
                            disabled                          // ✅ read-only, just for display
                            sx={fieldSx}
                        />
                    </Stack>

                    {/* RESULT + PERFORMED BY */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            select
                            label="Result"
                            fullWidth
                            size="small"
                            value={result}
                            onChange={e => setResult(e.target.value)}
                            sx={fieldSx}
                        >
                            <MenuItem value="PASS">Pass</MenuItem>
                            <MenuItem value="FAIL">Fail</MenuItem>
                        </TextField>
                        <TextField
                            label="Performed By *"
                            fullWidth
                            size="small"
                            value={performedBy}
                            onChange={e => setPerformedBy(e.target.value)}
                            sx={fieldSx}
                        />
                    </Stack>

                    <TextField
                        label="Notes"
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        sx={fieldSx}
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Size: <strong>{gauge?.gauge_type || '—'}</strong>
                    </Typography>

                    {/* INTERNAL SECTION */}
                    {isInternal && (
                        <>
                            <Divider sx={{ borderColor: '#f0f2f5' }} />
                            <Typography variant="caption" fontWeight={700} letterSpacing={1}
                                sx={{ color: '#9aa0b0', textTransform: 'uppercase' }}>
                                Internal Calibration Details
                            </Typography>
                            <TextField
                                label="Master Gauge Number *"
                                fullWidth
                                size="small"
                                value={masterGaugeNumber}
                                onChange={e => setMasterGaugeNumber(e.target.value)}
                                sx={fieldSx}
                            />
                            <TextField
                                label="Calibration Steps *"
                                fullWidth
                                multiline
                                rows={5}
                                size="small"
                                value={calibrationSteps}
                                onChange={e => setCalibrationSteps(e.target.value)}
                                placeholder={"Step 1: Zero gauge\nStep 2: Verify at 10mm..."}
                                sx={fieldSx}
                            />
                        </>
                    )}

                    {/* EXTERNAL SECTION */}
                    {isExternal && (
                        <>
                            <Divider sx={{ borderColor: '#f0f2f5' }} />
                            <Typography variant="caption" fontWeight={700} letterSpacing={1}
                                sx={{ color: '#9aa0b0', textTransform: 'uppercase' }}>
                                Calibration Certificate
                            </Typography>
                            <Box
                                component="label"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1.5px dashed #d0d5e0',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s, background 0.2s',
                                    '&:hover': { borderColor: '#f0a500', bgcolor: 'rgba(240,165,0,0.04)' },
                                }}
                            >
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    hidden
                                    onChange={e => setFile(e.target.files[0])}
                                />
                                <UploadFileIcon sx={{ color: file ? '#f0a500' : '#9aa0b0', fontSize: 22 }} />
                                <Box>
                                    <Typography variant="body2" fontWeight={600} color={file ? '#1a1f2e' : '#9aa0b0'}>
                                        {file ? file.name : 'Upload PDF Certificate'}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        Click to browse
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    )}
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
                    disabled={loading}
                    sx={{ bgcolor: '#f0a500', color: '#1a1f2e', fontWeight: 700, boxShadow: 'none', px: 3, '&:hover': { bgcolor: '#d4920a' }, '&:disabled': { bgcolor: '#e0e4ed' } }}
                >
                    {loading ? 'Saving...' : 'Save Calibration'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}