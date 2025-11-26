import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import * as cheerio from 'cheerio';

const router = express.Router();

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper function to extract domain from URL
const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
};

// SSRF Protection: Check if URL is safe to fetch
const isUrlSafeToFetch = (urlString: string): { safe: boolean; error?: string } => {
  try {
    const url = new URL(urlString);

    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { safe: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    const hostname = url.hostname.toLowerCase();

    // Block localhost and loopback
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return { safe: false, error: 'Internal addresses are not allowed' };
    }

    // Block IPv6 loopback
    if (hostname === '::1' || hostname === '[::1]') {
      return { safe: false, error: 'Internal addresses are not allowed' };
    }

    // Block private IP ranges
    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Pattern);
    if (match) {
      const [, a, b, c] = match.map(Number);
      // 10.0.0.0/8
      if (a === 10) return { safe: false, error: 'Private IP addresses are not allowed' };
      // 172.16.0.0/12
      if (a === 172 && b >= 16 && b <= 31) return { safe: false, error: 'Private IP addresses are not allowed' };
      // 192.168.0.0/16
      if (a === 192 && b === 168) return { safe: false, error: 'Private IP addresses are not allowed' };
      // 169.254.0.0/16 (link-local, includes AWS metadata)
      if (a === 169 && b === 254) return { safe: false, error: 'Link-local addresses are not allowed' };
      // 127.0.0.0/8
      if (a === 127) return { safe: false, error: 'Loopback addresses are not allowed' };
    }

    return { safe: true };
  } catch {
    return { safe: false, error: 'Invalid URL format' };
  }
};

// OG tag extraction endpoint (admin)
router.post('/fetch-og', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // SSRF Protection: Validate URL before fetching
    const urlCheck = isUrlSafeToFetch(url);
    if (!urlCheck.safe) {
      return res.status(400).json({ error: urlCheck.error });
    }

    // Fetch the HTML content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
        }
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to fetch URL' });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract OG tags
    const ogTitle = $('meta[property="og:title"]').attr('content') ||
                    $('meta[name="og:title"]').attr('content') ||
                    $('title').text() || '';

    const ogDescription = $('meta[property="og:description"]').attr('content') ||
                          $('meta[name="og:description"]').attr('content') ||
                          $('meta[name="description"]').attr('content') || '';

    const ogImage = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="og:image"]').attr('content') || '';

    const ogSiteName = $('meta[property="og:site_name"]').attr('content') ||
                       $('meta[name="og:site_name"]').attr('content') ||
                       extractDomain(url);

    // Extract published date from OG tags or article metadata
    const publishedTimeRaw =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[property="og:published_time"]').attr('content') ||
      $('meta[property="article:published_date"]').attr('content') ||
      $('meta[name="publish_date"]').attr('content') ||
      $('meta[name="pubdate"]').attr('content') ||
      $('meta[name="date"]').attr('content') ||
      $('time[datetime]').first().attr('datetime') ||
      '';

    // Parse and format the date (ISO 8601 or other formats → YYYY-MM-DD)
    let publishedAt: string | null = null;
    if (publishedTimeRaw) {
      try {
        const date = new Date(publishedTimeRaw);
        if (!isNaN(date.getTime())) {
          publishedAt = date.toISOString().split('T')[0];
        }
      } catch {
        // Ignore parsing errors
      }
    }

    res.json({
      title: ogTitle.trim(),
      description: ogDescription.trim(),
      image: ogImage,
      source: ogSiteName,
      source_url: url,
      published_at: publishedAt
    });
  } catch (error) {
    console.error('Error fetching OG tags:', error);
    res.status(500).json({ error: 'Failed to fetch OG tags' });
  }
});

// Get all published news (public) - with grouping (optimized single query)
router.get('/', async (req: Request, res: Response) => {
  try {
    // Single query to get all representative news with their related news
    const result = await query(
      `SELECT
         n.id, n.title, n.slug, n.content, n.source, n.source_url, n.image_url,
         n.published_at, n.created_at, n.group_id, n.is_representative,
         COALESCE(
           json_agg(
             json_build_object(
               'id', r.id,
               'title', r.title,
               'slug', r.slug,
               'content', r.content,
               'source', r.source,
               'source_url', r.source_url,
               'image_url', r.image_url,
               'published_at', r.published_at
             ) ORDER BY r.published_at DESC
           ) FILTER (WHERE r.id IS NOT NULL),
           '[]'::json
         ) as related_news
       FROM news n
       LEFT JOIN news r ON r.group_id = n.id
         AND r.is_representative = false
         AND r.is_published = true
       WHERE n.is_published = true AND n.is_representative = true
       GROUP BY n.id
       ORDER BY n.published_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get all news including unpublished (admin) - with grouping info
router.get('/admin/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Get all news with representative info, sorted by group
    const result = await query(
      `SELECT n.*,
              rep.title as representative_title
       FROM news n
       LEFT JOIN news rep ON n.group_id = rep.id
       ORDER BY
         COALESCE(n.group_id, n.id) DESC,
         n.is_representative DESC,
         n.published_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get representative news list (for grouping selection)
router.get('/admin/representatives', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, title, published_at
       FROM news
       WHERE is_representative = true
       ORDER BY published_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching representative news:', error);
    res.status(500).json({ error: 'Failed to fetch representative news' });
  }
});

// Get single news by slug (public)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const result = await query(
      `SELECT id, title, slug, content, source, source_url, image_url, published_at, created_at
       FROM news
       WHERE slug = $1 AND is_published = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get single news by ID (admin)
router.get('/admin/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM news WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Create news (admin only)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, source, source_url, image_url, published_at, is_published } = req.body;

    if (!title || !published_at) {
      return res.status(400).json({ error: 'Title and published_at are required' });
    }

    // Check for duplicate URL
    if (source_url) {
      const existingUrl = await query(
        'SELECT id, title FROM news WHERE source_url = $1',
        [source_url]
      );
      if (existingUrl.rows.length > 0) {
        return res.status(409).json({
          error: '이미 등록된 URL입니다',
          existing: existingUrl.rows[0]
        });
      }
    }

    // Generate slug from title with timestamp for uniqueness
    let slug = generateSlug(title);

    // Check if slug exists
    const existingSlug = await query('SELECT id FROM news WHERE slug = $1', [slug]);
    if (existingSlug.rows.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const result = await query(
      `INSERT INTO news (title, slug, content, source, source_url, image_url, published_at, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, slug, content, source, source_url, image_url, published_at, is_published || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// Update news (admin only)
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, source, source_url, image_url, published_at, is_published } = req.body;

    // If title changed, update slug
    let slugUpdate = '';
    const values: any[] = [];
    let paramIndex = 1;

    if (title) {
      let newSlug = generateSlug(title);
      const existingSlug = await query('SELECT id FROM news WHERE slug = $1 AND id != $2', [newSlug, id]);
      if (existingSlug.rows.length > 0) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      slugUpdate = `, slug = $${paramIndex}`;
      values.push(newSlug);
      paramIndex++;
    }

    const result = await query(
      `UPDATE news
       SET title = COALESCE($${paramIndex}, title),
           content = COALESCE($${paramIndex + 1}, content),
           source = COALESCE($${paramIndex + 2}, source),
           source_url = COALESCE($${paramIndex + 3}, source_url),
           image_url = COALESCE($${paramIndex + 4}, image_url),
           published_at = COALESCE($${paramIndex + 5}, published_at),
           is_published = COALESCE($${paramIndex + 6}, is_published)
           ${slugUpdate}
       WHERE id = $${paramIndex + 7}
       RETURNING *`,
      [...values, title, content, source, source_url, image_url, published_at, is_published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
});

// Delete news (admin only)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Before deleting, unlink any news that has this as group_id
    await query('UPDATE news SET group_id = NULL, is_representative = true WHERE group_id = $1', [id]);

    const result = await query('DELETE FROM news WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

// Set news group (admin only)
router.put('/:id/group', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { group_id } = req.body;

    if (group_id !== null && group_id !== undefined) {
      // Check if group_id exists and is a representative
      const repCheck = await query(
        'SELECT id, is_representative FROM news WHERE id = $1',
        [group_id]
      );

      if (repCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Representative news not found' });
      }

      if (!repCheck.rows[0].is_representative) {
        return res.status(400).json({ error: 'Target news is not a representative' });
      }

      // Cannot set self as group
      if (parseInt(id) === parseInt(group_id)) {
        return res.status(400).json({ error: 'Cannot assign news to itself' });
      }
    }

    // Update the news
    const result = await query(
      `UPDATE news
       SET group_id = $1,
           is_representative = $2
       WHERE id = $3
       RETURNING *`,
      [group_id || null, group_id ? false : true, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error setting news group:', error);
    res.status(500).json({ error: 'Failed to set news group' });
  }
});

// Set news as representative (admin only)
router.put('/:id/set-representative', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get current news info
    const newsResult = await query('SELECT * FROM news WHERE id = $1', [id]);
    if (newsResult.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    const news = newsResult.rows[0];

    // If already representative and not in a group, nothing to do
    if (news.is_representative && !news.group_id) {
      return res.json(news);
    }

    // If this news is part of a group, we need to:
    // 1. Make the old representative a member of the new group
    // 2. Transfer all group members to this news
    // 3. Make this news the representative
    if (news.group_id) {
      const oldRepId = news.group_id;

      // Update all members (except this one) to point to this news
      await query(
        `UPDATE news SET group_id = $1 WHERE group_id = $2 AND id != $3`,
        [id, oldRepId, id]
      );

      // Make old representative a member of this group
      await query(
        `UPDATE news SET group_id = $1, is_representative = false WHERE id = $2`,
        [id, oldRepId]
      );
    }

    // Make this news the representative
    const result = await query(
      `UPDATE news SET group_id = NULL, is_representative = true WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error setting news as representative:', error);
    res.status(500).json({ error: 'Failed to set news as representative' });
  }
});

export default router;
