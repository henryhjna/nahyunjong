import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Get published thoughts (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, subcategory } = req.query;
    let sql = 'SELECT id, title, title_en, slug, excerpt, excerpt_en, category, subcategory, cover_image_url, published_at, created_at FROM thoughts WHERE is_published = true';
    const params: any[] = [];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }
    if (subcategory) {
      params.push(subcategory);
      sql += ` AND subcategory = $${params.length}`;
    }

    sql += ' ORDER BY published_at DESC NULLS LAST, created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching thoughts:', error);
    res.status(500).json({ error: 'Failed to fetch thoughts' });
  }
});

// Get all thoughts (admin)
router.get('/admin/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM thoughts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all thoughts:', error);
    res.status(500).json({ error: 'Failed to fetch thoughts' });
  }
});

// Get single thought by slug (public)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const result = await query('SELECT * FROM thoughts WHERE slug = $1 AND is_published = true', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching thought:', error);
    res.status(500).json({ error: 'Failed to fetch thought' });
  }
});

// Create thought (admin)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, title_en, slug, excerpt, excerpt_en, content, content_en, category, subcategory, cover_image_url, is_published, published_at } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const finalSlug = slug || generateSlug(title);

    // Check slug uniqueness
    const existing = await query('SELECT id FROM thoughts WHERE slug = $1', [finalSlug]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const result = await query(
      `INSERT INTO thoughts (title, title_en, slug, excerpt, excerpt_en, content, content_en, category, subcategory, cover_image_url, is_published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [title, title_en || null, finalSlug, excerpt || null, excerpt_en || null, content || null, content_en || null, category || null, subcategory || null, cover_image_url || null, is_published || false, published_at || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating thought:', error);
    res.status(500).json({ error: 'Failed to create thought' });
  }
});

// Update thought (admin)
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, title_en, slug, excerpt, excerpt_en, content, content_en, category, subcategory, cover_image_url, is_published, published_at } = req.body;

    // Check slug uniqueness (exclude current)
    if (slug) {
      const existing = await query('SELECT id FROM thoughts WHERE slug = $1 AND id != $2', [slug, id]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }

    const result = await query(
      `UPDATE thoughts SET title = $1, title_en = $2, slug = $3, excerpt = $4, excerpt_en = $5, content = $6, content_en = $7, category = $8, subcategory = $9, cover_image_url = $10, is_published = $11, published_at = $12
       WHERE id = $13 RETURNING *`,
      [title, title_en || null, slug, excerpt || null, excerpt_en || null, content || null, content_en || null, category || null, subcategory || null, cover_image_url || null, is_published || false, published_at || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating thought:', error);
    res.status(500).json({ error: 'Failed to update thought' });
  }
});

// Delete thought (admin)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM thoughts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    res.json({ message: 'Thought deleted successfully' });
  } catch (error) {
    console.error('Error deleting thought:', error);
    res.status(500).json({ error: 'Failed to delete thought' });
  }
});

export default router;
