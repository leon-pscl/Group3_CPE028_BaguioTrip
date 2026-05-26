import { Router } from 'express';
import auth from '../middleware/auth.js';
import { get, run } from '../db.js';

const router = Router();

router.get('/', auth, (req, res) => {
  const trip = get('SELECT trip_data, updated_at FROM trips WHERE user_id = ?', [req.userId]);
  if (!trip) return res.json(null);
  res.json({ trip_data: JSON.parse(trip.trip_data), updated_at: trip.updated_at });
});

router.post('/', auth, (req, res) => {
  const { trip_data } = req.body;
  if (!trip_data) return res.status(400).json({ error: 'trip_data required' });
  const data = JSON.stringify(trip_data);
  run(
    `INSERT INTO trips (user_id, trip_data, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET
       trip_data = excluded.trip_data,
       updated_at = datetime('now')`,
    [req.userId, data]
  );
  res.json({ ok: true });
});

export default router;
