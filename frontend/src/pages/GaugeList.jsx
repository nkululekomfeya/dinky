import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';

import {
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    Stack,
    TextField,
    InputAdornment,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckOutDialog from '../components/CheckOutDialog';

const pulseRed = keyframes`
  0%   { background-color: rgba(220, 53, 69, 0.05); }
  50%  { background-color: rgba(220, 53, 69, 0.15); }
  100% { background-color: rgba(220, 53, 69, 0.05); }
`;

function getCalibrationStatus(nextDate) {
    if (!nextDate) return 'normal';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const next = new Date(nextDate); next.setHours(0, 0, 0, 0);
    const diffDays = (next - today) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 30) return 'due';
    return 'normal';
}

export default function GaugeList() {
    const [gauges, setGauges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gauges`)
            .then(res => res.json())
            .then(data => { setGauges(data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    const overdueCount = gauges.filter(g => getCalibrationStatus(g.next_calibration_date) === 'overdue').length;
    const dueCount = gauges.filter(g => getCalibrationStatus(g.next_calibration_date) === 'due').length;

    const filteredGauges = gauges.filter(g => {
        const term = search.toLowerCase();
        return (
            g.gauge_code?.toLowerCase().includes(term) ||
            g.gauge_type?.toLowerCase().includes(term) ||
            g.base_location?.toLowerCase().includes(term) ||
            g.current_location?.toLowerCase().includes(term)
        );
    });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f9', pb: 6 }}>
            

            {/* PAGE TITLE STRIP */}
            <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e4e8f0', py: 2, px: { xs: 2, md: 4 } }}>
                <Container maxWidth="lg">
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                            <Box>
                                <Typography variant="h6" fontWeight={700} color="#1a1f2e">
                                    All Active Gauges
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    {gauges.length} gauges tracked
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                {overdueCount > 0 && (
                                    <Chip
                                        icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                                        label={`${overdueCount} Overdue`}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(220,53,69,0.08)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.2)', fontWeight: 600, fontSize: '0.72rem' }}
                                    />
                                )}
                                {dueCount > 0 && (
                                    <Chip
                                        icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                                        label={`${dueCount} Due Soon`}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,193,7,0.08)', color: '#b8860b', border: '1px solid rgba(255,193,7,0.25)', fontWeight: 600, fontSize: '0.72rem' }}
                                    />
                                )}
                            </Stack>
                        </Stack>

                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/gauges/new')}
                            sx={{ bgcolor: '#f0a500', color: '#1a1f2e', fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#d4920a' } }}
                        >
                            Add Gauge
                        </Button>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 3 }}>

                {/* SEARCH */}
                <TextField
                    fullWidth
                    placeholder="Search by gauge code, type, location..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#9aa0b0' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#fff',
                            borderRadius: 2,
                            fontSize: '0.95rem',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            '& fieldset': { borderColor: '#e0e4ed' },
                            '&:hover fieldset': { borderColor: '#b0b8cc' },
                            '&.Mui-focused fieldset': { borderColor: '#1a1f2e' },
                        },
                    }}
                />

                {search && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {filteredGauges.length} result{filteredGauges.length !== 1 ? 's' : ''} for "{search}"
                    </Typography>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" mt={8}>
                        <CircularProgress sx={{ color: '#1a1f2e' }} />
                    </Box>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{
                        borderRadius: 3,
                        border: '1.5px solid #e4e8f0',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                    }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#1a1f2e' }}>
                                    {['Gauge Code', 'Size', 'Base Location', 'Current Location', 'Next Calibration'].map(h => (
                                        <TableCell key={h} sx={{
                                            color: '#9aa0b0', fontWeight: 700, fontSize: '0.72rem',
                                            letterSpacing: 0.8, textTransform: 'uppercase',
                                            borderBottom: 'none', py: 1.8,
                                        }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredGauges.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#9aa0b0' }}>
                                            No gauges found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredGauges.map(gauge => (
                                        <GaugeRow
                                            key={gauge.id}
                                            gauge={gauge}
                                            onOpen={() => navigate(`/gauges/${gauge.id}`)}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Container>
        </Box>
    );
}

/* -------------------------
   Gauge Row Component
-------------------------- */
function GaugeRow({ gauge, onOpen }) {
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const isCheckedOut =
        gauge.current_location &&
        gauge.base_location &&
        gauge.current_location !== gauge.base_location;

    const status = getCalibrationStatus(gauge.next_calibration_date);

    const rowSx = {
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        ...(status === 'overdue' && { animation: `${pulseRed} 2s infinite` }),
        ...(status === 'due' && { bgcolor: 'rgba(255, 193, 7, 0.06)' }),
        '&:hover': {
            bgcolor: status === 'overdue'
                ? 'rgba(220,53,69,0.1)'
                : status === 'due'
                    ? 'rgba(255,193,7,0.12)'
                    : 'rgba(26,31,46,0.03)',
        },
        '& td': { borderColor: '#f0f2f5' },
    };

    const calibrationCell = () => {
        if (!gauge.next_calibration_date) return <Typography variant="body2" color="text.disabled">—</Typography>;
        const label = new Date(gauge.next_calibration_date).toLocaleDateString();
        if (status === 'overdue') return (
            <Chip label={label} size="small" sx={{ bgcolor: 'rgba(220,53,69,0.1)', color: '#dc3545', fontWeight: 600, fontSize: '0.75rem', border: '1px solid rgba(220,53,69,0.2)' }} />
        );
        if (status === 'due') return (
            <Chip label={label} size="small" sx={{ bgcolor: 'rgba(255,193,7,0.1)', color: '#b8860b', fontWeight: 600, fontSize: '0.75rem', border: '1px solid rgba(255,193,7,0.3)' }} />
        );
        return <Typography variant="body2" color="text.secondary">{label}</Typography>;
    };

    return (
        <TableRow hover onClick={onOpen} sx={rowSx}>
            <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={700}
                        sx={{ fontFamily: 'monospace', color: '#f0a500', letterSpacing: 0.5 }}>
                        {gauge.gauge_code}
                    </Typography>

                    {!isCheckedOut && (
                        <Tooltip title="Check out gauge">
                            <IconButton size="small"
                                onClick={e => { e.stopPropagation(); setCheckoutOpen(true); }}
                                sx={{ color: '#9aa0b0', '&:hover': { color: '#1a1f2e', bgcolor: 'rgba(26,31,46,0.08)' } }}>
                                <ExitToAppIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {isCheckedOut && (
                        <Tooltip title="Check in gauge">
                            <IconButton size="small"
                                onClick={async e => {
                                    e.stopPropagation();
                                    const technician = prompt('Enter technician name:');
                                    if (!technician) return;

                                    const baseLocation = gauge.base_location || 'Not specified';
                                    prompt(`Base location for this gauge is:`, baseLocation);
                                    try {
                                        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gauges/${gauge.id}/checkin`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ technician, part_number: null }),
                                        });
                                        if (!res.ok) throw new Error('Check-in failed');
                                        window.location.reload();
                                    } catch (err) { alert(err.message); }
                                }}
                                sx={{ color: '#2ecc71', '&:hover': { color: '#27ae60', bgcolor: 'rgba(46,204,113,0.1)' } }}>
                                <LoginIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}

                    <CheckOutDialog
                        open={checkoutOpen}
                        gauge={gauge}
                        onClose={() => setCheckoutOpen(false)}
                        onSuccess={() => window.location.reload()}
                    />
                </Box>
            </TableCell>

            <TableCell><Typography variant="body2" color="text.secondary">{gauge.gauge_type || '—'}</Typography></TableCell>
            <TableCell><Typography variant="body2" color="text.secondary">{gauge.description || '—'}</Typography></TableCell>
            <TableCell>
                {isCheckedOut ? (
                    <Chip label={gauge.current_location} size="small" sx={{ bgcolor: 'rgba(240,165,0,0.1)', color: '#b8860b', fontWeight: 600, fontSize: '0.75rem', border: '1px solid rgba(240,165,0,0.25)' }} />
                ) : (
                    <Typography variant="body2" color="text.secondary">{gauge.current_location || '—'}</Typography>
                )}
            </TableCell>
            <TableCell>{calibrationCell()}</TableCell>
        </TableRow>
    );
}