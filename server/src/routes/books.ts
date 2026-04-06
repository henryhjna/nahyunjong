import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all published books (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, title, title_en, subtitle, subtitle_en, authors, publisher, published_date, isbn,
              cover_image_url, description, description_en, table_of_contents, table_of_contents_en, purchase_url, order_index
       FROM books
       WHERE is_published = true
       ORDER BY order_index ASC, published_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get all books including unpublished (admin)
router.get('/admin/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM books ORDER BY order_index ASC, published_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get single book by ID (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT id, title, title_en, subtitle, subtitle_en, authors, publisher, published_date, isbn,
              cover_image_url, description, description_en, table_of_contents, table_of_contents_en, purchase_url
       FROM books
       WHERE id = $1 AND is_published = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Get single book by ID (admin)
router.get('/admin/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM books WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Create book (admin only)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, title_en, subtitle, subtitle_en, authors, publisher, published_date,
      isbn, cover_image_url, description, description_en, table_of_contents, table_of_contents_en,
      purchase_url, is_published, order_index
    } = req.body;

    if (!title || !authors) {
      return res.status(400).json({ error: 'Title and authors are required' });
    }

    const result = await query(
      `INSERT INTO books (title, title_en, subtitle, subtitle_en, authors, publisher, published_date,
                          isbn, cover_image_url, description, description_en, table_of_contents, table_of_contents_en,
                          purchase_url, is_published, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [title, title_en, subtitle, subtitle_en, authors, publisher, published_date,
       isbn, cover_image_url, description, description_en, table_of_contents, table_of_contents_en,
       purchase_url, is_published ?? true, order_index ?? 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// Update book (admin only)
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title, title_en, subtitle, subtitle_en, authors, publisher, published_date,
      isbn, cover_image_url, description, description_en, table_of_contents, table_of_contents_en,
      purchase_url, is_published, order_index
    } = req.body;

    const result = await query(
      `UPDATE books
       SET title = COALESCE($1, title),
           title_en = $2,
           subtitle = COALESCE($3, subtitle),
           subtitle_en = $4,
           authors = COALESCE($5, authors),
           publisher = COALESCE($6, publisher),
           published_date = COALESCE($7, published_date),
           isbn = COALESCE($8, isbn),
           cover_image_url = COALESCE($9, cover_image_url),
           description = COALESCE($10, description),
           description_en = $11,
           table_of_contents = COALESCE($12, table_of_contents),
           table_of_contents_en = $13,
           purchase_url = COALESCE($14, purchase_url),
           is_published = COALESCE($15, is_published),
           order_index = COALESCE($16, order_index)
       WHERE id = $17
       RETURNING *`,
      [title, title_en, subtitle, subtitle_en, authors, publisher, published_date,
       isbn, cover_image_url, description, description_en, table_of_contents, table_of_contents_en,
       purchase_url, is_published, order_index, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Delete book (admin only)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM books WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

export default router;
