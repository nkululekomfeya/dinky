import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    Box,
    Button,
    Container,
    Divider,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';



export default function AddGauge() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        gauge_code: '',
        description: '',
        gauge_type: '',
        
        verification_type: 'EXTERNAL',
        status: 'ACTIVE',
        base_location: '',
        
        last_calibration_date: '',
        calibration_frequency_months: 6,
        calibration_steps: []
    });

   /* function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }
*/
    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }


    function addStep() {
        setForm(prev => ({
            ...prev,
            calibration_steps: [...prev.calibration_steps, { name: '', target_value: '' }]
        }));
    }

    function updateStep(index, field, value) {
        const steps = [...form.calibration_steps];
        steps[index][field] = value;
        setForm({ ...form, calibration_steps: steps });
    }

    function removeStep(index) {
        setForm({
            ...form,
            calibration_steps: form.calibration_steps.filter((_, i) => i !== index)
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gauges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to create gauge');
                return;
            }

            navigate('/gauges');
        } catch (err) {
            console.error(err);
            alert('Failed to create gauge');
        }
    }

    return (
        <>
            

            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>

                            <Typography variant="h6" fontWeight="bold">
                                Gauge Information
                            </Typography>

                            <TextField
                                label="Serial Number"
                                name="gauge_code"
                                required
                                value={form.gauge_code}
                                onChange={handleChange}
                            />

                            <TextField
                                select
                                label="Gauge Description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                fullWidth
                            >
                                <MenuItem value="Plain Plug Gauge">Plain Plug Gauge</MenuItem>
                                <MenuItem value="Fixed Gap Gauge">Fixed Gap Gauge</MenuItem>
                                <MenuItem value="Flush Pin Gauge">Flush Pin Gauge</MenuItem>
                                <MenuItem value="Screw Ring Gauge">Screw Ring Gauge</MenuItem>
                                <MenuItem value="Screw Plug Gauge">Screw Plug Gauge</MenuItem>
                                <MenuItem value="Screw Depth Gauge">Screw Depth Gauge</MenuItem>
                                <MenuItem value="Step Ring">Step Ring</MenuItem>
                                <MenuItem value="Plug Depth Gauge">Plug Depth Gauge</MenuItem>
                                <MenuItem value="Plain Ring Gauge">Plain Ring Gauge</MenuItem>
                                <MenuItem value="Height Gauge">Height Gauge</MenuItem>
                                <MenuItem value="Temperature Gauge">Temperature Gauge</MenuItem>
                                <MenuItem value="Pressure Gauge">Pressure Gauge</MenuItem>
                                <MenuItem value="Gauge Block">Gauge Block</MenuItem>
                                <MenuItem value="Shadow Graph">Shadow Graph</MenuItem>
                                <MenuItem value="Torque Tester">Torque Tester</MenuItem>
                                <MenuItem value="Roughness Tester">Roughness Tester</MenuItem>
                                <MenuItem value="Vernicder Caliper">Vernier Caliper</MenuItem>
                                <MenuItem value="Micrometre">Micrometre</MenuItem>
                                
                            </TextField>

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Type / Size"
                                    name="gauge_type"
                                    
                                    value={form.gauge_type}
                                    onChange={handleChange}
                                />
                                <TextField
                                select
                                label="Verification Type"
                                name="verification_type"
                                fullWidth
                                value={form.verification_type}
                                onChange={e => {
                                    handleChange(e);
                                    if (e.target.value === 'EXTERNAL') {
                                        setForm(prev => ({ ...prev, calibration_steps: [] }));
                                    }
                                }}
                            >
                                <MenuItem value="EXTERNAL">External</MenuItem>
                                <MenuItem value="INTERNAL">Internal</MenuItem>
                            </TextField>
                                
                            </Stack>

                            

                            

                            <Divider />

                            <Typography variant="h6" fontWeight="bold">
                                Location
                            </Typography>

                            <TextField
                                label="Base Location"
                                name="base_location"
                                required
                                value={form.base_location}
                                onChange={handleChange}
                            />

                           

                            <Divider />

                            <Typography variant="h6" fontWeight="bold">
                                Calibration
                            </Typography>

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    type="date"
                                    label="Last Calibration Date"
                                    name="last_calibration_date"
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    fullWidth
                                    value={form.last_calibration_date}
                                    onChange={handleChange}
                                />

                                <TextField
                                    type="number"
                                    label="Frequency (months)"
                                    name="calibration_frequency_months"
                                    required
                                    fullWidth
                                    value={form.calibration_frequency_months}
                                    onChange={handleChange}
                                />
                            </Stack>

                            {form.verification_type === 'INTERNAL' && (
                                <>
                                    <Divider />

                                    <Typography variant="h6" fontWeight="bold">
                                        Calibration Steps
                                    </Typography>

                                    {form.calibration_steps.map((step, index) => (
                                        <Stack direction="row" spacing={2} key={index}>
                                            <TextField
                                                label="Step Name"
                                                fullWidth
                                                value={step.name}
                                                onChange={e => updateStep(index, 'name', e.target.value)}
                                            />

                                            <TextField
                                                label="Target Value"
                                                type="number"
                                                fullWidth
                                                value={step.target_value}
                                                onChange={e => updateStep(index, 'target_value', e.target.value)}
                                            />

                                            <Button
                                                color="error"
                                                onClick={() => removeStep(index)}
                                            >
                                                <DeleteIcon />
                                            </Button>
                                        </Stack>
                                    ))}

                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={addStep}
                                        variant="outlined"
                                    >
                                        Add Step
                                    </Button>
                                </>
                            )}

                            <Divider />

                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                >
                                    Save Gauge
                                </Button>
                            </Box>

                        </Stack>
                    </form>
                </Paper>
            </Container>
        </>
    );
}

