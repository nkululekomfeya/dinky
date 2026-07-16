import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

/**
 * CHECK OUT a gauge
 */


router.post('/checkout', async (req, res) => {
    const {
        gauge_id,
        to_location,
        technician,
        part_number
    } = req.body;

    if (!gauge_id || !to_location || !technician) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Get current gauge info
        const gaugeResult = await pool.query(
            'SELECT base_location, current_location FROM gauges WHERE id = $1',
            [gauge_id]
        );

        if (gaugeResult.rowCount === 0) {
            return res.status(404).json({ error: 'Gauge not found' });
        }

        const { current_location } = gaugeResult.rows[0];

        // 2. Insert movement
        await pool.query(
            `
            INSERT INTO movements (
                gauge_id,
                movement_type,
                from_location,
                to_location,
                technician,
                part_number
            )
            VALUES ($1,'OUT',$2,$3,$4,$5)
            `,
            [
                gauge_id,
                current_location,
                to_location,
                technician,
                part_number || null
            ]
        );

        // 3. Update gauge current location
        await pool.query(
            `
            UPDATE gauges
            SET current_location = $1
            WHERE id = $2
            `,
            [to_location, gauge_id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Checkout failed:', err);
        res.status(500).json({ error: 'Checkout failed' });
    }
});

export default router;
