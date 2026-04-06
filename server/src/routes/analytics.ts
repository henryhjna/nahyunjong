import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

// Hash IP for privacy (no raw IPs stored)
const hashIp = (ip: string): string =>
  crypto.createHash('sha256').update(ip + 'nahyunjong-salt').digest('hex').slice(0, 16);

// Record a page view (public, called from client)
router.post('/pageview', async (req: Request, res: Response) => {
  try {
    const { path, locale, referrer } = req.body;
    if (!path) return res.status(400).json({ error: 'path required' });

    const userAgent = req.headers['user-agent'] || null;
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || '';
    const ipHash = hashIp(ip);

    await query(
      'INSERT INTO page_views (path, locale, referrer, user_agent, ip_hash) VALUES ($1, $2, $3, $4, $5)',
      [path, locale || null, referrer || null, userAgent, ipHash]
    );

    res.status(204).end();
  } catch (error) {
    console.error('Error recording pageview:', error);
    res.status(500).json({ error: 'Failed to record' });
  }
});

// Get analytics summary (admin only)
router.get('/summary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { days = '30' } = req.query;
    const daysNum = Math.min(parseInt(days as string) || 30, 365);

    // Total views for period
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM page_views WHERE created_at >= NOW() - INTERVAL '${daysNum} days'`
    );

    // Unique visitors (by ip_hash) for period
    const uniqueResult = await query(
      `SELECT COUNT(DISTINCT ip_hash) as unique_visitors FROM page_views WHERE created_at >= NOW() - INTERVAL '${daysNum} days'`
    );

    // Today's views
    const todayResult = await query(
      `SELECT COUNT(*) as today FROM page_views WHERE created_at::date = CURRENT_DATE`
    );

    // Top pages
    const topPagesResult = await query(
      `SELECT path, COUNT(*) as views FROM page_views WHERE created_at >= NOW() - INTERVAL '${daysNum} days' GROUP BY path ORDER BY views DESC LIMIT 20`
    );

    // Daily trend
    const dailyResult = await query(
      `SELECT created_at::date as date, COUNT(*) as views, COUNT(DISTINCT ip_hash) as unique_visitors
       FROM page_views WHERE created_at >= NOW() - INTERVAL '${daysNum} days'
       GROUP BY created_at::date ORDER BY date ASC`
    );

    // Locale breakdown
    const localeResult = await query(
      `SELECT COALESCE(locale, 'unknown') as locale, COUNT(*) as views FROM page_views WHERE created_at >= NOW() - INTERVAL '${daysNum} days' GROUP BY locale ORDER BY views DESC`
    );

    res.json({
      period: daysNum,
      total: parseInt(totalResult.rows[0].total),
      uniqueVisitors: parseInt(uniqueResult.rows[0].unique_visitors),
      today: parseInt(todayResult.rows[0].today),
      topPages: topPagesResult.rows,
      daily: dailyResult.rows,
      locales: localeResult.rows,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
