import { useState } from 'react';
import React from 'react';

import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Fab,
    Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import SpeedIcon from '@mui/icons-material/Speed';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/dinkylogo.png';

const navItems = [
/*    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon sx={{ fontSize: 16 }} /> },*/
    { label: 'Gauges', path: '/gauges', icon: <SpeedIcon sx={{ fontSize: 16 }} /> },
/*    { label: 'Production', path: '/stock-items', icon: <PrecisionManufacturingIcon sx={{ fontSize: 16 }} /> },
    { label: 'Quality', path: '/quality', icon: <EditDocumentIcon sx={{ fontSize: 16 }} /> },
    { label: 'Maintenance', path: '/maintenance', icon: <EditDocumentIcon sx={{ fontSize: 16 }} /> },
    { label: 'Tooling', path: '/tooling', icon: <BuildIcon sx={{ fontSize: 16 }} /> },*/
];

export default function AppHeader({ title }) {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = useState(null);

    const openMenu = (e) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);
    const handleNav = (path) => { navigate(path); closeMenu(); };

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    bgcolor: '#1a1f2e',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, minHeight: { xs: 56, md: 64 } }}>

                    {/* LEFT — LOGO */}
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1.5 }}
                        onClick={() => navigate('/')}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="Logo"
                            sx={{
                                height: { xs: 28, md: 34 },
                                filter: 'brightness(0) invert(1)',
                                opacity: 0.9,
                            }}
                        />
                        {!isMobile && (
                            <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(255,255,255,0.15)', mx: 0.5 }} />
                        )}
                        {!isMobile && (
                            <Typography
                                variant="body2"
                                sx={{ color: '#9aa0b0', fontWeight: 500, letterSpacing: 0.3 }}
                            >
                                {title}
                            </Typography>
                        )}
                    </Box>

                    {/* RIGHT — NAV */}
                    {isMobile ? (
                        <>
                            <IconButton onClick={openMenu} sx={{ color: '#9aa0b0', '&:hover': { color: '#fff' } }}>
                                <MenuIcon />
                            </IconButton>

                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={closeMenu}
                                PaperProps={{
                                    elevation: 0,
                                    sx: {
                                        bgcolor: '#1a1f2e',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 2,
                                        minWidth: 180,
                                        mt: 1,
                                    }
                                }}
                            >
                                {navItems.map((item, i) => (
                                    <MenuItem
                                        key={item.path}
                                        onClick={() => handleNav(item.path)}
                                        sx={{
                                            color: isActive(item.path) ? '#f0a500' : '#9aa0b0',
                                            fontWeight: isActive(item.path) ? 700 : 400,
                                            gap: 1.5,
                                            py: 1.2,
                                            fontSize: '0.9rem',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' },
                                        }}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {navItems.map(item => (
                                <Button
                                    key={item.path}
                                    startIcon={item.icon}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        color: isActive(item.path) ? '#f0a500' : '#9aa0b0',
                                        fontWeight: isActive(item.path) ? 700 : 500,
                                        fontSize: '0.85rem',
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 2,
                                        position: 'relative',
                                        '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
                                        ...(isActive(item.path) && {
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: 0,
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 20,
                                                height: 2,
                                                bgcolor: '#f0a500',
                                                borderRadius: 1,
                                            }
                                        }),
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}

                            <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(255,255,255,0.1)', mx: 1 }} />

                            <Button
                                startIcon={<QrCodeScannerIcon sx={{ fontSize: 16 }} />}
                                onClick={() => navigate('/scan')}
                                variant="outlined"
                                size="small"
                                sx={{
                                    color: '#f0a500',
                                    borderColor: 'rgba(240,165,0,0.4)',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    px: 1.5,
                                    '&:hover': { borderColor: '#f0a500', bgcolor: 'rgba(240,165,0,0.08)' },
                                }}
                            >
                                Scan
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* MOBILE FAB */}
            <Fab
                onClick={() => navigate('/scan')}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1300,
                    display: { xs: 'flex', md: 'none' },
                    bgcolor: '#f0a500',
                    color: '#1a1f2e',
                    '&:hover': { bgcolor: '#d4920a' },
                    boxShadow: '0 4px 16px rgba(240,165,0,0.4)',
                }}
            >
                <QrCodeScannerIcon />
            </Fab>
        </>
    );
}