import express, { Request, Response } from 'express';
import { query } from '../config/database';

const router = express.Router();

// Get all lectures for a course
router.get('/course/:courseId', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const result = await query(
      'SELECT * FROM lectures WHERE course_id = $1 AND is_published = true ORDER BY week ASC, order_index ASC',
      [courseId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lectures:', error);
    res.status(500).json({ error: 'Failed to fetch lectures' });
  }
});

// Get single lecture
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM lectures WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lecture:', error);
    res.status(500).json({ error: 'Failed to fetch lecture' });
  }
});

// Create lecture
router.post('/', async (req: Request, res: Response) => {
  try {
    const { course_id, week, title, subtitle, mdx_content, order_index } = req.body;

    const result = await query(
      `INSERT INTO lectures (course_id, week, title, subtitle, mdx_content, order_index, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING *`,
      [course_id, week, title, subtitle, mdx_content, order_index || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating lecture:', error);
    res.status(500).json({ error: 'Failed to create lecture' });
  }
});

// Update lecture
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { week, title, subtitle, mdx_content, order_index, is_published } = req.body;

    const result = await query(
      `UPDATE lectures
       SET week = COALESCE($1, week),
           title = COALESCE($2, title),
           subtitle = COALESCE($3, subtitle),
           mdx_content = COALESCE($4, mdx_content),
           order_index = COALESCE($5, order_index),
           is_published = COALESCE($6, is_published),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [week, title, subtitle, mdx_content, order_index, is_published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lecture:', error);
    res.status(500).json({ error: 'Failed to update lecture' });
  }
});

// Delete lecture
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM lectures WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    res.status(500).json({ error: 'Failed to delete lecture' });
  }
});

export default router;
