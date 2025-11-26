import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all published publications (public) with categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const { year, tier, type, category } = req.query;

    let sql = `
      SELECT p.id, p.title, p.title_en, p.authors, p.journal, p.journal_tier,
             p.publication_type, p.year, p.volume, p.issue, p.pages, p.doi,
             p.abstract, p.pdf_url,
             COALESCE(array_agg(pc.category) FILTER (WHERE pc.category IS NOT NULL), '{}') as categories
      FROM publications p
      LEFT JOIN publication_categories pc ON p.id = pc.publication_id
      WHERE p.is_published = true
    `;
    const params: any[] = [];

    if (year) {
      params.push(year);
      sql += ` AND p.year = $${params.length}`;
    }

    if (tier) {
      params.push(tier);
      sql += ` AND p.journal_tier = $${params.length}`;
    }

    if (type) {
      params.push(type);
      sql += ` AND p.publication_type = $${params.length}`;
    }

    if (category) {
      params.push(category);
      sql += ` AND EXISTS (SELECT 1 FROM publication_categories pc2 WHERE pc2.publication_id = p.id AND pc2.category = $${params.length})`;
    }

    sql += ' GROUP BY p.id ORDER BY p.year DESC, p.id DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ error: 'Failed to fetch publications' });
  }
});

// Get all publications including unpublished (admin) with categories
router.get('/admin/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT p.*,
              COALESCE(array_agg(pc.category) FILTER (WHERE pc.category IS NOT NULL), '{}') as categories
       FROM publications p
       LEFT JOIN publication_categories pc ON p.id = pc.publication_id
       GROUP BY p.id
       ORDER BY p.year DESC, p.id DESC`
    );
    console.log('Admin publications fetched:', result.rows.length, 'items');
    console.log('Sample categories:', result.rows.slice(0, 3).map((r: any) => ({ id: r.id, categories: r.categories })));
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all publications:', error);
    res.status(500).json({ error: 'Failed to fetch publications' });
  }
});

// Get single publication by ID (public) with categories
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.id, p.title, p.title_en, p.authors, p.journal, p.journal_tier,
              p.publication_type, p.year, p.volume, p.issue, p.pages, p.doi,
              p.abstract, p.pdf_url,
              COALESCE(array_agg(pc.category) FILTER (WHERE pc.category IS NOT NULL), '{}') as categories
       FROM publications p
       LEFT JOIN publication_categories pc ON p.id = pc.publication_id
       WHERE p.id = $1 AND p.is_published = true
       GROUP BY p.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching publication:', error);
    res.status(500).json({ error: 'Failed to fetch publication' });
  }
});

// Get single publication by ID (admin) with categories
router.get('/admin/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*,
              COALESCE(array_agg(pc.category) FILTER (WHERE pc.category IS NOT NULL), '{}') as categories
       FROM publications p
       LEFT JOIN publication_categories pc ON p.id = pc.publication_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching publication:', error);
    res.status(500).json({ error: 'Failed to fetch publication' });
  }
});

// Create publication (admin only)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, title_en, authors, journal, journal_tier, publication_type, year,
      volume, issue, pages, doi, abstract, pdf_url, is_published, categories
    } = req.body;

    // Validate: at least one title required
    if (!title && !title_en) {
      return res.status(400).json({ error: '한글 제목 또는 영문 제목 중 하나는 필수입니다' });
    }

    if (!authors || !year) {
      return res.status(400).json({ error: '저자와 연도는 필수입니다' });
    }

    // Insert publication
    const result = await query(
      `INSERT INTO publications (title, title_en, authors, journal, journal_tier, publication_type, year,
                                 volume, issue, pages, doi, abstract, pdf_url, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [title || null, title_en || null, authors, journal, journal_tier, publication_type || 'paper', year,
       volume, issue, pages, doi, abstract, pdf_url, is_published ?? true]
    );

    const publication = result.rows[0];

    // Insert categories if provided
    if (categories && Array.isArray(categories) && categories.length > 0) {
      const categoryValues = categories
        .filter((c: string) => c && c.trim())
        .map((c: string) => c.trim());

      if (categoryValues.length > 0) {
        const placeholders = categoryValues.map((_, i) => `($1, $${i + 2})`).join(', ');
        await query(
          `INSERT INTO publication_categories (publication_id, category) VALUES ${placeholders}`,
          [publication.id, ...categoryValues]
        );
      }
    }

    // Return publication with categories
    publication.categories = categories || [];
    res.status(201).json(publication);
  } catch (error) {
    console.error('Error creating publication:', error);
    res.status(500).json({ error: 'Failed to create publication' });
  }
});

// Update publication (admin only)
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title, title_en, authors, journal, journal_tier, publication_type, year,
      volume, issue, pages, doi, abstract, pdf_url, is_published, categories
    } = req.body;

    // Check if at least one title will exist after update
    if (title === '' && title_en === '') {
      return res.status(400).json({ error: '한글 제목 또는 영문 제목 중 하나는 필수입니다' });
    }

    const result = await query(
      `UPDATE publications
       SET title = $1,
           title_en = $2,
           authors = COALESCE($3, authors),
           journal = $4,
           journal_tier = $5,
           publication_type = COALESCE($6, publication_type),
           year = COALESCE($7, year),
           volume = $8,
           issue = $9,
           pages = $10,
           doi = $11,
           abstract = $12,
           pdf_url = $13,
           is_published = COALESCE($14, is_published),
           updated_at = NOW()
       WHERE id = $15
       RETURNING *`,
      [title || null, title_en || null, authors, journal || null, journal_tier || null,
       publication_type, year, volume || null, issue || null, pages || null,
       doi || null, abstract || null, pdf_url || null, is_published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    const publication = result.rows[0];

    // Update categories if provided
    if (categories !== undefined) {
      // Delete existing categories
      await query('DELETE FROM publication_categories WHERE publication_id = $1', [id]);

      // Insert new categories
      if (Array.isArray(categories) && categories.length > 0) {
        const categoryValues = categories
          .filter((c: string) => c && c.trim())
          .map((c: string) => c.trim());

        if (categoryValues.length > 0) {
          const placeholders = categoryValues.map((_, i) => `($1, $${i + 2})`).join(', ');
          await query(
            `INSERT INTO publication_categories (publication_id, category) VALUES ${placeholders}`,
            [id, ...categoryValues]
          );
        }
      }
      publication.categories = categories.filter((c: string) => c && c.trim());
    }

    res.json(publication);
  } catch (error) {
    console.error('Error updating publication:', error);
    res.status(500).json({ error: 'Failed to update publication' });
  }
});

// Delete publication (admin only)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM publications WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    res.json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Error deleting publication:', error);
    res.status(500).json({ error: 'Failed to delete publication' });
  }
});

export default router;
