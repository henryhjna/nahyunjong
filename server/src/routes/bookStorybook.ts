import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// ============================================
// Public Endpoints
// ============================================

// Get storybook data for a published book
router.get('/:bookId/storybook', async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;

    // Get book info
    const bookResult = await query(
      `SELECT id, title, subtitle, authors, cover_image_url
       FROM books WHERE id = $1 AND is_published = true`,
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Get chapters with pages
    const chaptersResult = await query(
      `SELECT c.id, c.title, c.cover_image_url, c.order_index,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', p.id,
                    'image_url', p.image_url,
                    'text_content', p.text_content,
                    'order_index', p.order_index
                  ) ORDER BY p.order_index
                ) FILTER (WHERE p.id IS NOT NULL),
                '[]'
              ) as pages
       FROM book_chapters c
       LEFT JOIN book_pages p ON p.chapter_id = c.id
       WHERE c.book_id = $1
       GROUP BY c.id
       ORDER BY c.order_index`,
      [bookId]
    );

    // Calculate total pages
    const totalPages = chaptersResult.rows.reduce(
      (sum, chapter) => sum + (chapter.pages?.length || 0),
      0
    );

    res.json({
      book: bookResult.rows[0],
      chapters: chaptersResult.rows,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching storybook:', error);
    res.status(500).json({ error: 'Failed to fetch storybook' });
  }
});

// ============================================
// Admin Endpoints
// ============================================

// Get all storybook data (admin)
router.get('/:bookId/storybook/admin', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { bookId } = req.params;

    const bookResult = await query('SELECT * FROM books WHERE id = $1', [bookId]);
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const chaptersResult = await query(
      `SELECT c.id, c.title, c.cover_image_url, c.order_index, c.created_at, c.updated_at,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', p.id,
                    'image_url', p.image_url,
                    'text_content', p.text_content,
                    'order_index', p.order_index,
                    'created_at', p.created_at,
                    'updated_at', p.updated_at
                  ) ORDER BY p.order_index
                ) FILTER (WHERE p.id IS NOT NULL),
                '[]'
              ) as pages
       FROM book_chapters c
       LEFT JOIN book_pages p ON p.chapter_id = c.id
       WHERE c.book_id = $1
       GROUP BY c.id
       ORDER BY c.order_index`,
      [bookId]
    );

    res.json({
      book: bookResult.rows[0],
      chapters: chaptersResult.rows,
    });
  } catch (error) {
    console.error('Error fetching storybook admin:', error);
    res.status(500).json({ error: 'Failed to fetch storybook' });
  }
});

// Create chapter
router.post('/:bookId/chapters', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { bookId } = req.params;
    const { title, cover_image_url, order_index } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Get max order_index if not provided
    let orderIdx = order_index;
    if (orderIdx === undefined) {
      const maxResult = await query(
        'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM book_chapters WHERE book_id = $1',
        [bookId]
      );
      orderIdx = maxResult.rows[0].next_order;
    }

    const result = await query(
      `INSERT INTO book_chapters (book_id, title, cover_image_url, order_index)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [bookId, title, cover_image_url || null, orderIdx]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

// Update chapter
router.put('/:bookId/chapters/:chapterId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { chapterId } = req.params;
    const { title, cover_image_url, order_index } = req.body;

    const result = await query(
      `UPDATE book_chapters
       SET title = COALESCE($1, title),
           cover_image_url = COALESCE($2, cover_image_url),
           order_index = COALESCE($3, order_index)
       WHERE id = $4 RETURNING *`,
      [title, cover_image_url, order_index, chapterId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

// Delete chapter
router.delete('/:bookId/chapters/:chapterId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { chapterId } = req.params;

    const result = await query(
      'DELETE FROM book_chapters WHERE id = $1 RETURNING id',
      [chapterId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

// Reorder chapters
router.put('/:bookId/chapters/reorder', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { chapters } = req.body;

    if (!Array.isArray(chapters)) {
      return res.status(400).json({ error: 'chapters must be an array' });
    }

    for (const chapter of chapters) {
      await query(
        'UPDATE book_chapters SET order_index = $1 WHERE id = $2',
        [chapter.order_index, chapter.id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering chapters:', error);
    res.status(500).json({ error: 'Failed to reorder chapters' });
  }
});

// Create page
router.post('/:bookId/chapters/:chapterId/pages', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { chapterId } = req.params;
    const { image_url, text_content, order_index } = req.body;

    // Get max order_index if not provided
    let orderIdx = order_index;
    if (orderIdx === undefined) {
      const maxResult = await query(
        'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM book_pages WHERE chapter_id = $1',
        [chapterId]
      );
      orderIdx = maxResult.rows[0].next_order;
    }

    const result = await query(
      `INSERT INTO book_pages (chapter_id, image_url, text_content, order_index)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [chapterId, image_url || null, text_content || null, orderIdx]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

// Update page
router.put('/:bookId/pages/:pageId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;
    const { image_url, text_content, order_index } = req.body;

    const result = await query(
      `UPDATE book_pages
       SET image_url = COALESCE($1, image_url),
           text_content = COALESCE($2, text_content),
           order_index = COALESCE($3, order_index)
       WHERE id = $4 RETURNING *`,
      [image_url, text_content, order_index, pageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// Delete page
router.delete('/:bookId/pages/:pageId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;

    const result = await query(
      'DELETE FROM book_pages WHERE id = $1 RETURNING id',
      [pageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

// Reorder pages within a chapter
router.put('/:bookId/chapters/:chapterId/pages/reorder', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { pages } = req.body;

    if (!Array.isArray(pages)) {
      return res.status(400).json({ error: 'pages must be an array' });
    }

    for (const page of pages) {
      await query(
        'UPDATE book_pages SET order_index = $1 WHERE id = $2',
        [page.order_index, page.id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering pages:', error);
    res.status(500).json({ error: 'Failed to reorder pages' });
  }
});

export default router;
