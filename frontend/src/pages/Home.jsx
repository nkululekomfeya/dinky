import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    useTheme
} from '@mui/material';

// Icons representing each module
import SpeedIcon from '@mui/icons-material/Speed';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BuildIcon from '@mui/icons-material/Build';

const navigationTiles = [
    {
        title: 'Gauges',
        description: 'Real-time telemetry, sensor data, and key performance indicators.',
        path: '/gauges',
        icon: <SpeedIcon sx={{ fontSize: 40 }} />,
        color: '#0288d1', // Light Blue
    },
    {
        title: 'Production',
        description: 'Monitor active runs, schedule updates, and output tracking.',
        path: '/production',
        icon: <PrecisionManufacturingIcon sx={{ fontSize: 40 }} />,
        color: '#2e7d32', // Green
    },
    {
        title: 'Quality',
        description: 'Defect logs, inspection checklists, and compliance metrics.',
        path: '/quality',
        icon: <VerifiedUserIcon sx={{ fontSize: 40 }} />,
        color: '#ed6c02', // Orange
    },
    {
        title: 'Maintenance',
        description: 'Work orders, equipment health, and scheduled downtime.',
        path: '/maintenance',
        icon: <BuildIcon sx={{ fontSize: 40 }} />,
        color: '#d32f2f', // Red
    },
];

export default function HomePage() {
    const theme = useTheme();

    return (
        <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
            {/* Header Section */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    fontWeight="bold"
                    color="text.primary"
                >
                    Operations Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Select a module below to view live data and manage workflows.
                </Typography>
            </Box>

            {/* Navigation Grid */}
            <Grid container spacing={4}>
                {navigationTiles.map((tile) => (
                    <Grid item xs={12} sm={6} key={tile.title}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 3,
                                boxShadow: theme.shadows[2],
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[6],
                                }
                            }}
                        >
                            {/* CardActionArea makes the entire card clickable and handles routing via react-router-dom */}
                            <CardActionArea
                                component={Link}
                                to={tile.path}
                                sx={{ flexGrow: 1, p: 2 }}
                            >
                                <CardContent>
                                    {/* Icon Wrapper with Custom Colored Background */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 70,
                                            height: 70,
                                            borderRadius: '50%',
                                            backgroundColor: `${tile.color}15`, // 15% opacity of the theme color
                                            color: tile.color,
                                            mb: 3
                                        }}
                                    >
                                        {tile.icon}
                                    </Box>

                                    <Typography
                                        gutterBottom
                                        variant="h5"
                                        component="h2"
                                        fontWeight="600"
                                    >
                                        {tile.title}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {tile.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}