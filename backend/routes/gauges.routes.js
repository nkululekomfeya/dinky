import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

/* ===============================
   GET all gauges
================================ */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM gauges
            ORDER BY gauge_code
        `);

        res.json(result.rows); // always an array
    } catch (err) {
        console.error('Fetch gauges error:', err);
        res.status(500).json({ error: 'Failed to fetch gauges' });
    }
});

//update gauge dates from calibration form

router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { last_calibration_date, next_calibration_date } = req.body;

    try {
        const result = await pool.query(
            `UPDATE gauges 
             SET last_calibration_date = $1, next_calibration_date = $2 
             WHERE id = $3 
             RETURNING *`,
            [last_calibration_date, next_calibration_date, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Gauge not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Gauge update error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/* ===============================
   GET single gauge + history
================================ */
router.get('/:id', async (req, res) => {
    const dbCheck = await pool.query('SELECT current_database()');
    console.log('CONNECTED DB:', dbCheck.rows[0].current_database);

    const { id } = req.params;

    try {
        const gaugeResult = await pool.query(
            'SELECT * FROM gauges WHERE id = $1',
            [id]
        );

        if (gaugeResult.rowCount === 0) {
            return res.status(404).json({ error: 'Gauge not found' });
        }

        const calibrationsResult = await pool.query(
            `SELECT *
             FROM calibrations
             WHERE gauge_id = $1
             ORDER BY calibration_date DESC`,
            [id]
        );

        const movementsResult = await pool.query(
            `SELECT *
     FROM movements
     WHERE gauge_id = $1
     ORDER BY movement_date DESC`,
            [id]
        );


        res.json({
            gauge: gaugeResult.rows[0],
            calibrations: calibrationsResult.rows,
            movements: movementsResult.rows
        });
    } catch (err) {
        console.error('Fetch gauge detail error:', err);
        res.status(500).json({ error: 'Failed to fetch gauge' });
    }
});

/* ===============================
   CHECK OUT gauge
================================ */
router.post('/:id/checkout', async (req, res) => {
    const { id } = req.params;
    const { to_location, technician, part_number } = req.body;

    if (!to_location || !technician) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const gaugeRes = await pool.query(
            'SELECT current_location FROM gauges WHERE id = $1',
            [id]
        );

        if (gaugeRes.rowCount === 0) {
            return res.status(404).json({ error: 'Gauge not found' });
        }

        const fromLocation = gaugeRes.rows[0].current_location;

        await pool.query(
            'UPDATE gauges SET current_location = $1 WHERE id = $2',
            [to_location, id]
        );

        await pool.query(
            `INSERT INTO movements (
                gauge_id,
                movement_type,
                from_location,
                to_location,
                technician,
                part_number
            )
            VALUES ($1, 'OUT', $2, $3, $4, $5)`,
            [id, fromLocation, to_location, technician, part_number || null]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({ error: 'Checkout failed' });
    }
});
/* ===============================
   UPDATE gauge Edit under gauge info 
================================ */
router.put('/:id', async (req, res) => {
    const { id } = req.params;

    const {
        gauge_code,
        description,
        gauge_type,
        
        
        verification_type,
        base_location,
        calibration_frequency_months
    } = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE gauges
                SET
                  gauge_code = $1,
                  description = $2,
                  gauge_type = $3,
                 
                  verification_type = $4,
                  base_location = $5,
                  calibration_frequency_months = $6
                WHERE id = $7
                RETURNING *
            `,
              [
  gauge_code,
  description,
  gauge_type,
 
  verification_type,
  base_location,
  calibration_frequency_months,
  id
]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Gauge not found' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Update gauge error:', err);
        res.status(500).json({ error: 'Failed to update gauge' });
    }
});

/* ===============================
   CHECK IN gauge
================================ */
router.post('/:id/checkin', async (req, res) => {
    const { id } = req.params;
    const { technician } = req.body;

    if (!technician) {
        return res.status(400).json({ error: 'Technician is required' });
    }

    try {
        const gaugeRes = await pool.query(
            'SELECT current_location, base_location FROM gauges WHERE id = $1',
            [id]
        );

        if (gaugeRes.rowCount === 0) {
            return res.status(404).json({ error: 'Gauge not found' });
        }

        const { current_location, base_location } = gaugeRes.rows[0];

        await pool.query(
            'UPDATE gauges SET current_location = $1 WHERE id = $2',
            [base_location, id]
        );

        await pool.query(
            `INSERT INTO movements (
                gauge_id,
                movement_type,
                from_location,
                to_location,
                technician
            )
            VALUES ($1, 'IN', $2, $3, $4)`,
            [id, current_location, base_location, technician]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ error: 'Check-in failed' });
    }
});

/* ===============================
   CREATE new gauge (checked in)
================================ */
router.post('/', async (req, res) => {
    try {
        const {
            gauge_code,
            description,
            gauge_type,
            
            
            verification_type,
            base_location,
            last_calibration_date,
            calibration_frequency_months
        } = req.body;

        if (
            !gauge_code ||
            !verification_type ||
            !base_location ||
            !last_calibration_date ||
            !calibration_frequency_months
        ) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const lastDate = new Date(last_calibration_date);
        if (isNaN(lastDate)) {
            return res.status(400).json({ error: 'Invalid calibration date' });
        }

        const freq = Number(calibration_frequency_months);
        if (isNaN(freq) || freq <= 0) {
            return res.status(400).json({ error: 'Invalid calibration frequency' });
        }

        const nextCalibration = new Date(lastDate);
        nextCalibration.setMonth(nextCalibration.getMonth() + freq);

        const result = await pool.query(
            `INSERT INTO gauges (
                gauge_code,
                description,
                gauge_type,
                verification_type,
                base_location,
                current_location,
                last_calibration_date,
                calibration_frequency_months,
                next_calibration_date
            )
            VALUES ($1,$2,$3,$4,$5,$5,$6,$7,$8)
            RETURNING *`,
            [
                gauge_code,
                description,
                gauge_type,    
                verification_type,
                base_location,
                lastDate,
                freq,
                nextCalibration
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create gauge error:', err);
        res.status(500).json({ error: 'Failed to create gauge' });
    }
});

export default router;
