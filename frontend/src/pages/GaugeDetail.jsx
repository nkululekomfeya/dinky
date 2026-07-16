import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CalibrationDialog from '../components/CalibrationDialog';
import QRCode from "react-qr-code";
import { keyframes } from '@mui/system';
import CheckOutDialog from '../components/CheckOutDialog';
import EditDialog from '../components/EditDialog';


import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SpeedIcon from '@mui/icons-material/Speed';
import PlaceIcon from '@mui/icons-material/Place';
import EventIcon from '@mui/icons-material/Event';
import VerifiedIcon from '@mui/icons-material/Verified';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';

const pulseRed = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
  70%  { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
`;

export default function GaugeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [calDialogOpen, setCalDialogOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [stepsOpen, setStepsOpen] = useState(false);
    const [gauge, setGauge] = useState(null);
    const [calibrations, setCalibrations] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [showAllCalibrations, setShowAllCalibrations] = useState(false);

    const isCheckedOut =
        gauge?.current_location &&
        gauge?.base_location &&
        gauge.current_location !== gauge.base_location;

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gauges/${id}`)
            .then(res => res.json())
            .then(data => {
                setGauge(data.gauge);
                setCalibrations(data.calibrations || []);
                setMovements(data.movements || []);
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    }, [id]);

    const refreshGauge = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gauges/${id}`);
            const data = await res.json();
            setGauge(data.gauge);
            setCalibrations(data.calibrations || []);
            setMovements(data.movements || []);
        } catch (err) { console.error('Refresh failed', err); }
    };

    const handleCheckIn = async () => {
        const technician = prompt('Enter technician name:');
        if (!technician) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gauges/${gauge.id}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ technician, part_number: null }),
            });
            if (!res.ok) throw new Error('Check-in failed');
            await refreshGauge();
        } catch (err) { alert(err.message); }
    };

    function handleDelete() {
        if (!confirm('Delete this gauge?')) return;
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gauges/${id}`, { method: 'DELETE' })
            .then(res => { if (!res.ok) throw new Error('Failed to delete'); return res.json(); })
            .then(() => navigate('/gauges'))
            .catch(err => { console.error(err); alert('Delete failed'); });
    }

    const formatDate = d => d ? new Date(d).toLocaleDateString() : '—';
    const formatDateTime = d => d ? new Date(d).toLocaleString() : '—';

    const getCalStatus = (nextDate) => {
        if (!nextDate) return 'normal';
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const next = new Date(nextDate); next.setHours(0, 0, 0, 0);
        const diff = (next - today) / (1000 * 60 * 60 * 24);
        if (diff < 0) return 'overdue';
        if (diff <= 30) return 'due';
        return 'normal';
    };
    console.log("React Version:", React.version);
    const calStatus = getCalStatus(gauge?.next_calibration_date);

    if (loading) return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#1a1f2e' }} />
        </Box>
    );

    if (!gauge) return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">Gauge not found</Typography>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f9', pb: 6 }}>

            {/* HEADER BAR */}
            <Box sx={{
                bgcolor: '#1a1f2e',
                color: '#fff',
                py: 3,
                px: { xs: 2, md: 4 },
                mb: 4,
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}>
                <Container maxWidth="md">
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <SpeedIcon sx={{ fontSize: 28, color: '#f0a500' }} />
                            <Box>
                                <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
                                    {gauge.gauge_code}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#9aa0b0' }}>
                                    {gauge.gauge_type || 'Gauge Detail'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {calStatus === 'overdue' && (
                                <Chip label="Calibration Overdue" size="small"
                                    sx={{ bgcolor: 'rgba(220,53,69,0.15)', color: '#ff6b6b', border: '1px solid rgba(220,53,69,0.3)', fontWeight: 600 }} />
                            )}
                            {calStatus === 'due' && (
                                <Chip label="Due for Calibration" size="small"
                                    sx={{ bgcolor: 'rgba(255,193,7,0.15)', color: '#f0a500', border: '1px solid rgba(255,193,7,0.3)', fontWeight: 600 }} />
                            )}
                            {isCheckedOut && (
                                <Chip label="Checked Out" size="small"
                                    sx={{ bgcolor: 'rgba(26,31,46,0.4)', color: '#fff', fontWeight: 600 }} />
                            )}
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="md">

                {/* ACTION BUTTONS */}
                <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{ color: '#1a1f2e', borderColor: '#d0d5e0', '&:hover': { borderColor: '#1a1f2e', bgcolor: 'rgba(26,31,46,0.04)' } }}
                        variant="outlined"
                    >
                        Back
                    </Button>
                    <Button
                        startIcon={<EditIcon />}
                        variant="outlined"
                        onClick={() => setEditOpen(true)}
                        sx={{ color: '#1a1f2e', borderColor: '#d0d5e0', '&:hover': { borderColor: '#1a1f2e', bgcolor: 'rgba(26,31,46,0.04)' } }}
                    >
                        Edit
                    </Button>
                    <Button
                        startIcon={<DeleteIcon />}
                        variant="outlined"
                        onClick={handleDelete}
                        sx={{ color: '#dc3545', borderColor: 'rgba(220,53,69,0.4)', '&:hover': { borderColor: '#dc3545', bgcolor: 'rgba(220,53,69,0.04)' } }}
                    >
                        Delete
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setCalDialogOpen(true)}
                        sx={{ bgcolor: '#f0a500', color: '#1a1f2e', fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#d4920a' } }}
                    >
                        Add Calibration
                    </Button>

                </Stack>

                {/* MAIN CONTENT ROW */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={3} alignItems="flex-start">

                    {/* GAUGE INFO CARD */}
                    <Paper elevation={0} sx={{
                        flex: 1,
                        borderRadius: 3,
                        border: '1.5px solid #e4e8f0',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                    }}>
                        <Box sx={{ height: 4, bgcolor: '#1a1f2e' }} />
                        <Box sx={{ p: 3 }}>
                            <Typography variant="caption" fontWeight={700} letterSpacing={1}
                                sx={{ color: '#9aa0b0', textTransform: 'uppercase', mb: 2, display: 'block' }}>
                                Gauge Information
                            </Typography>

                            <Stack spacing={1.5}>
                                <InfoRow label="Description" value={gauge.description} />
                                <InfoRow label="Type / Size" value={gauge.gauge_type} />
                                <InfoRow label="Status" value={gauge.status} />
                                <InfoRow label="Verification" value={gauge.verification_type} />
                                <Divider sx={{ borderColor: '#f0f2f5' }} />
                                <InfoRow
                                    label="Base Location"
                                    value={gauge.base_location}
                                    icon={<PlaceIcon sx={{ fontSize: 14, color: '#9aa0b0' }} />}
                                />
                                <InfoRow
                                    label="Current Location"
                                    value={gauge.current_location}
                                    highlight={isCheckedOut}
                                    icon={<PlaceIcon sx={{ fontSize: 14, color: isCheckedOut ? '#f0a500' : '#9aa0b0' }} />}
                                />
                                <Divider sx={{ borderColor: '#f0f2f5' }} />
                                <InfoRow
                                    label="Last Calibration"
                                    value={formatDate(gauge.last_calibration_date)}
                                    icon={<EventIcon sx={{ fontSize: 14, color: '#9aa0b0' }} />}
                                />
                                <InfoRow
                                    label="Next Calibration"
                                    value={formatDate(gauge.next_calibration_date)}
                                    highlight={calStatus !== 'normal'}
                                    highlightColor={calStatus === 'overdue' ? '#dc3545' : '#b8860b'}
                                    icon={<EventIcon sx={{ fontSize: 14, color: calStatus !== 'normal' ? '#f0a500' : '#9aa0b0' }} />}
                                />
                                <InfoRow
                                    label="Frequency"
                                    value={gauge.calibration_frequency_months
                                        ? `${gauge.calibration_frequency_months} ${gauge.calibration_frequency_months === 1 ? 'month' : 'months'}`
                                        : null}
                                    icon={<VerifiedIcon sx={{ fontSize: 14, color: '#9aa0b0' }} />}
                                />
                            </Stack>
                        </Box>
                    </Paper>

                    {/* QR + ISSUE/RETURN */}
                    <Paper elevation={0} sx={{
                        borderRadius: 3,
                        border: isCheckedOut ? '1.5px solid rgba(220,53,69,0.4)' : '1.5px solid #e4e8f0',
                        boxShadow: isCheckedOut
                            ? '0 0 0 0 rgba(220,53,69,0.4)'
                            : '0 2px 12px rgba(0,0,0,0.05)',
                        animation: isCheckedOut ? `${pulseRed} 2s infinite` : 'none',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        minWidth: 180,
                    }}>
                        <Box sx={{ height: 4, bgcolor: isCheckedOut ? '#dc3545' : '#1a1f2e', width: '100%', borderRadius: '2px 2px 0 0', mt: -3, mb: 1 }} />
                        <Typography variant="caption" fontWeight={700} letterSpacing={1}
                            sx={{ color: '#9aa0b0', textTransform: 'uppercase' }}>
                            QR Code
                        </Typography>
                        <QRCode value={`${window.location.origin}/gauges/${gauge.id}`} size={120} />
                        <Typography variant="caption" color="text.disabled" textAlign="center">
                            Scan to open this gauge
                        </Typography>

                        <Divider sx={{ width: '100%', borderColor: '#f0f2f5' }} />

                        {!isCheckedOut ? (
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<ExitToAppIcon />}
                                onClick={() => setCheckoutOpen(true)}
                                sx={{ bgcolor: '#1a1f2e', color: '#fff', fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#2d3348' } }}
                            >
                                Issue
                            </Button>
                        ) : (
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<LoginIcon />}
                                onClick={handleCheckIn}
                                sx={{ bgcolor: '#2ecc71', color: '#fff', fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#27ae60' } }}
                            >
                                Return
                            </Button>
                        )}
                    </Paper>
                </Stack>

                {/* CALIBRATION HISTORY */}
                <SectionTable
                    title="Calibration History"
                    empty={calibrations.length === 0}
                    emptyText="No calibration records"
                    headers={['Date', 'Due', 'Result', 'Performed By', 'Certificate', 'Notes']}
                    showAll={showAllCalibrations}
                    total={calibrations.length}
                    limit={2}
                    onToggle={() => setShowAllCalibrations(v => !v)}
                >
                    {(showAllCalibrations ? calibrations : calibrations.slice(0, 2)).map(c => (
                        <TableRow key={c.id} sx={{ '& td': { borderColor: '#f0f2f5' } }}>
                            <TableCell><Typography variant="body2">{formatDate(c.calibration_date)}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{formatDate(c.due_date)}</Typography></TableCell>
                            <TableCell>
                                {c.result ? (
                                    <Chip label={c.result} size="small" sx={{
                                        fontWeight: 700, fontSize: '0.72rem',
                                        bgcolor: c.result === 'PASS' ? 'rgba(46,204,113,0.1)' : 'rgba(220,53,69,0.1)',
                                        color: c.result === 'PASS' ? '#27ae60' : '#dc3545',
                                        border: `1px solid ${c.result === 'PASS' ? 'rgba(46,204,113,0.3)' : 'rgba(220,53,69,0.3)'}`,
                                    }} />
                                ) : <Typography variant="body2" color="text.disabled">—</Typography>}
                            </TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{c.performed_by || '—'}</Typography></TableCell>
                            <TableCell>
                                {c.certificate_path ? (
                                    <Button size="small" component="a"
                                       
                                        href={c.certificate_path}
                                        target="_blank" rel="noreferrer"
                                        sx={{ color: '#f0a500', fontWeight: 700, p: 0, minWidth: 0 }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        View
                                    </Button>
                                ) : <Typography variant="body2" color="text.disabled">—</Typography>}
                            </TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{c.notes || '—'}</Typography></TableCell>
                        </TableRow>
                    ))}
                </SectionTable>

                {/* MOVEMENTS TABLE */}
                <SectionTable
                    title="Gauge Movements"
                    empty={movements.length === 0}
                    emptyText="No movements recorded"
                    headers={['Date / Time', 'Type', 'From', 'To', 'Technician', 'Part Number']}
                    showAll={showAllHistory}
                    total={movements.length}
                    limit={5}
                    onToggle={() => setShowAllHistory(v => !v)}
                >
                    {(showAllHistory ? movements : movements.slice(0, 5)).map(m => (
                        <TableRow key={m.id} sx={{ '& td': { borderColor: '#f0f2f5' } }}>
                            <TableCell><Typography variant="body2" color="text.secondary">{formatDateTime(m.movement_date)}</Typography></TableCell>
                            <TableCell>
                                <Chip label={m.movement_type} size="small" sx={{
                                    fontWeight: 600, fontSize: '0.7rem',
                                    bgcolor: m.movement_type === 'CHECKOUT' ? 'rgba(240,165,0,0.1)' : 'rgba(46,204,113,0.1)',
                                    color: m.movement_type === 'CHECKOUT' ? '#b8860b' : '#27ae60',
                                    border: `1px solid ${m.movement_type === 'CHECKOUT' ? 'rgba(240,165,0,0.3)' : 'rgba(46,204,113,0.3)'}`,
                                }} />
                            </TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{m.from_location || '—'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{m.to_location || '—'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{m.technician || '—'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{m.part_number || '—'}</Typography></TableCell>
                        </TableRow>
                    ))}
                </SectionTable>

            </Container>

            <CheckOutDialog
                open={checkoutOpen}
                gauge={gauge}
                onClose={() => setCheckoutOpen(false)}
                onSuccess={refreshGauge}
            />
            <CalibrationDialog
                open={calDialogOpen}
                onClose={() => setCalDialogOpen(false)}
                gaugeId={id}
                gaugeType={gauge?.verification_type}
                onSuccess={refreshGauge}
            />
            <EditDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                gauge={gauge}
                onUpdated={refreshGauge}
            />
            <CalibrationStepsDialog
                open={stepsOpen}
                onClose={() => setStepsOpen(false)}
                gaugeId={gauge.id}
            />
        </Box>
    );
}

/* -------------------------
   Info Row
-------------------------- */
function InfoRow({ label, value, icon, highlight, highlightColor }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            {icon && <Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>}
            <Typography variant="caption" color="text.disabled" sx={{ minWidth: 110 }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={600}
                color={highlight ? (highlightColor || '#f0a500') : '#2d3348'}
                sx={{ flex: 1 }}
            >
                {value || '—'}
            </Typography>
        </Stack>
    );
}

/* -------------------------
   Section Table Wrapper
-------------------------- */
function SectionTable({ title, empty, emptyText, headers, children, showAll, total, limit, onToggle }) {
    return (
        <Box mb={3}>
            <Typography variant="caption" fontWeight={700} letterSpacing={1}
                sx={{ color: '#9aa0b0', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                {title}
            </Typography>

            {empty ? (
                <Typography variant="body2" color="text.disabled">{emptyText}</Typography>
            ) : (
                <Paper elevation={0} sx={{
                    borderRadius: 3,
                    border: '1.5px solid #e4e8f0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#1a1f2e' }}>
                                {headers.map(h => (
                                    <TableCell key={h} sx={{
                                        color: '#9aa0b0', fontWeight: 700, fontSize: '0.7rem',
                                        letterSpacing: 0.8, textTransform: 'uppercase',
                                        borderBottom: 'none', py: 1.5,
                                    }}>
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>{children}</TableBody>
                    </Table>
                    {total > limit && (
                        <Box sx={{ px: 2, py: 1, borderTop: '1px solid #f0f2f5' }}>
                            <Button size="small" onClick={onToggle}
                                sx={{ color: '#f0a500', fontWeight: 700, fontSize: '0.75rem' }}>
                                {showAll ? 'Show Less' : `Show All ${total}`}
                            </Button>
                        </Box>
                    )}
                    </Paper>

            )}
        </Box>
    );
}