import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all published courses
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM courses WHERE is_published = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get single course by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM courses WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Get all courses including unpublished (admin)
router.get('/admin/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM courses ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create course (admin only)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, code, semester, thumbnail_url } = req.body;

    const result = await query(
      `INSERT INTO courses (title, description, code, semester, thumbnail_url, is_published)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING *`,
      [title, description, code, semester, thumbnail_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course (admin only)
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, code, semester, thumbnail_url, is_published } = req.body;

    const result = await query(
      `UPDATE courses
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           code = COALESCE($3, code),
           semester = COALESCE($4, semester),
           thumbnail_url = COALESCE($5, thumbnail_url),
           is_published = COALESCE($6, is_published),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, code, semester, thumbnail_url, is_published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course (admin only)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
