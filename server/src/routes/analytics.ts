import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

const hashIp = (ip: string): string =>
  crypto.createHash('sha256').update(ip + 'nahyunjong-salt').digest('hex').slice(0, 16);

const getIp = (req: Request): string =>
  req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || '';

// Check if IP is excluded
const isExcluded = async (ipHash: string): Promise<boolean> => {
  const result = await query('SELECT 1 FROM analytics_excluded_ips WHERE ip_hash = $1', [ipHash]);
  return result.rows.length > 0;
};

// Record a page view (public)
router.post('/pageview', async (req: Request, res: Response) => {
  try {
    const { path, locale, referrer } = req.body;
    if (!path) return res.status(400).json({ error: 'path required' });

    const ipHash = hashIp(getIp(req));

    // Skip if excluded IP
    if (await isExcluded(ipHash)) return res.status(204).end();

    const userAgent = req.headers['user-agent'] || null;
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

    // Exclude admin IPs from all counts
    const excludeClause = `AND ip_hash NOT IN (SELECT ip_hash FROM analytics_excluded_ips)`;

    const totalResult = await query(
      `SELECT COUNT(*) as total FROM page_views WHERE created_at >= NOW() - INTERVAL '${daysNum} days' ${excludeClause}`
    );

    const uniqueResult = await query(
      `SELECT COUNT(DISTINCT ip_hash) as unique_visitors FROM page_views WHERE created_at >= NOW() - INTERVAL '${daysNum} days' ${excludeClause}`
    );

    const todayResult = await query(
      `SELECT COUNT(*) as today FROM page_views WHERE created_at::date = CURRENT_DATE ${excludeClause}`
    );

    const topPagesResult = await query(
      `SELECT path, COUNT(*) as views FROM page_views WHERE created_at >= NOW() - INTERVAL '${daysNum} days' ${excludeClause} GROUP BY path ORDER BY views DESC LIMIT 20`
    );

    const dailyResult = await query(
      `SELECT created_at::date as date, COUNT(*) as views, COUNT(DISTINCT ip_hash) as unique_visitors
       FROM page_views WHERE created_at >= NOW() - INTERVAL '${daysNum} days' ${excludeClause}
       GROUP BY created_at::date ORDER BY date ASC`
    );

    const localeResult = await query(
      `SELECT COALESCE(locale, 'unknown') as locale, COUNT(*) as views FROM page_views WHERE created_at >= NOW() - INTERVAL '${daysNum} days' ${excludeClause} GROUP BY locale ORDER BY views DESC`
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

// Register current IP as excluded (admin only)
router.post('/exclude-my-ip', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const ipHash = hashIp(getIp(req));
    const { label } = req.body;
    await query(
      'INSERT INTO analytics_excluded_ips (ip_hash, label) VALUES ($1, $2) ON CONFLICT (ip_hash) DO UPDATE SET label = $2',
      [ipHash, label || null]
    );
    res.json({ ip_hash: ipHash, message: 'IP excluded' });
  } catch (error) {
    console.error('Error excluding IP:', error);
    res.status(500).json({ error: 'Failed to exclude IP' });
  }
});

// List excluded IPs (admin only)
router.get('/excluded-ips', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM analytics_excluded_ips ORDER BY created_at DESC');
    const currentIpHash = hashIp(getIp(req));
    res.json({ ips: result.rows, currentIpHash });
  } catch (error) {
    console.error('Error fetching excluded IPs:', error);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// Remove excluded IP (admin only)
router.delete('/excluded-ips/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM analytics_excluded_ips WHERE id = $1', [id]);
    res.json({ message: 'Removed' });
  } catch (error) {
    console.error('Error removing excluded IP:', error);
    res.status(500).json({ error: 'Failed to remove' });
  }
});

// Purge own visits (admin only)
router.delete('/purge-my-views', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const ipHash = hashIp(getIp(req));
    const result = await query('DELETE FROM page_views WHERE ip_hash = $1', [ipHash]);
    res.json({ deleted: result.rowCount });
  } catch (error) {
    console.error('Error purging views:', error);
    res.status(500).json({ error: 'Failed to purge' });
  }
});

export default router;
