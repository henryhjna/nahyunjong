import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get full profile with education, career, awards (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get profile
    const profileResult = await query(
      'SELECT * FROM professor_profile ORDER BY id LIMIT 1'
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = profileResult.rows[0];

    // Get education
    const educationResult = await query(
      'SELECT * FROM professor_education WHERE profile_id = $1 ORDER BY sort_order ASC, year_end DESC NULLS FIRST',
      [profile.id]
    );

    // Get career
    const careerResult = await query(
      'SELECT * FROM professor_career WHERE profile_id = $1 ORDER BY sort_order ASC, is_current DESC, year_end DESC NULLS FIRST',
      [profile.id]
    );

    // Get awards
    const awardsResult = await query(
      'SELECT * FROM professor_awards WHERE profile_id = $1 ORDER BY sort_order ASC, year DESC',
      [profile.id]
    );

    res.json({
      ...profile,
      education: educationResult.rows,
      career: careerResult.rows,
      awards: awardsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get basic profile info only (for landing page)
router.get('/basic', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, name_en, title, affiliation, email, photo_url, bio, research_interests FROM professor_profile ORDER BY id LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching basic profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile (admin only)
router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, name_en, title, affiliation, email, photo_url, bio, bio_detail, research_interests
    } = req.body;

    // Get existing profile id
    const existingProfile = await query('SELECT id FROM professor_profile ORDER BY id LIMIT 1');

    if (existingProfile.rows.length === 0) {
      // Create new profile if none exists
      const result = await query(
        `INSERT INTO professor_profile (name, name_en, title, affiliation, email, photo_url, bio, bio_detail, research_interests)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [name, name_en, title, affiliation, email, photo_url, bio, bio_detail, research_interests || []]
      );
      return res.json(result.rows[0]);
    }

    const profileId = existingProfile.rows[0].id;
    const result = await query(
      `UPDATE professor_profile
       SET name = COALESCE($1, name),
           name_en = $2,
           title = $3,
           affiliation = $4,
           email = $5,
           photo_url = $6,
           bio = $7,
           bio_detail = $8,
           research_interests = COALESCE($9, research_interests),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [name, name_en, title, affiliation, email, photo_url, bio, bio_detail, research_interests, profileId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==================== EDUCATION ====================

// Add education (admin only)
router.post('/education', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { degree, field, institution, institution_en, year_start, year_end, description, sort_order } = req.body;

    // Get profile id
    const profileResult = await query('SELECT id FROM professor_profile ORDER BY id LIMIT 1');
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found. Create profile first.' });
    }
    const profileId = profileResult.rows[0].id;

    const result = await query(
      `INSERT INTO professor_education (profile_id, degree, field, institution, institution_en, year_start, year_end, description, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [profileId, degree, field, institution, institution_en, year_start, year_end, description, sort_order || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ error: 'Failed to add education' });
  }
});

// Update education (admin only)
router.put('/education/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { degree, field, institution, institution_en, year_start, year_end, description, sort_order } = req.body;

    const result = await query(
      `UPDATE professor_education
       SET degree = COALESCE($1, degree),
           field = $2,
           institution = COALESCE($3, institution),
           institution_en = $4,
           year_start = $5,
           year_end = $6,
           description = $7,
           sort_order = COALESCE($8, sort_order)
       WHERE id = $9
       RETURNING *`,
      [degree, field, institution, institution_en, year_start, year_end, description, sort_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Education not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({ error: 'Failed to update education' });
  }
});

// Delete education (admin only)
router.delete('/education/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM professor_education WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Education not found' });
    }

    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

// ==================== CAREER ====================

// Add career (admin only)
router.post('/career', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { position, organization, organization_en, year_start, year_end, is_current, description, sort_order } = req.body;

    // Get profile id
    const profileResult = await query('SELECT id FROM professor_profile ORDER BY id LIMIT 1');
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found. Create profile first.' });
    }
    const profileId = profileResult.rows[0].id;

    const result = await query(
      `INSERT INTO professor_career (profile_id, position, organization, organization_en, year_start, year_end, is_current, description, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [profileId, position, organization, organization_en, year_start, year_end, is_current || false, description, sort_order || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding career:', error);
    res.status(500).json({ error: 'Failed to add career' });
  }
});

// Update career (admin only)
router.put('/career/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { position, organization, organization_en, year_start, year_end, is_current, description, sort_order } = req.body;

    const result = await query(
      `UPDATE professor_career
       SET position = COALESCE($1, position),
           organization = COALESCE($2, organization),
           organization_en = $3,
           year_start = $4,
           year_end = $5,
           is_current = COALESCE($6, is_current),
           description = $7,
           sort_order = COALESCE($8, sort_order)
       WHERE id = $9
       RETURNING *`,
      [position, organization, organization_en, year_start, year_end, is_current, description, sort_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Career not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating career:', error);
    res.status(500).json({ error: 'Failed to update career' });
  }
});

// Delete career (admin only)
router.delete('/career/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM professor_career WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Career not found' });
    }

    res.json({ message: 'Career deleted successfully' });
  } catch (error) {
    console.error('Error deleting career:', error);
    res.status(500).json({ error: 'Failed to delete career' });
  }
});

// ==================== AWARDS ====================

// Add award (admin only)
router.post('/awards', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, organization, year, description, sort_order } = req.body;

    // Get profile id
    const profileResult = await query('SELECT id FROM professor_profile ORDER BY id LIMIT 1');
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found. Create profile first.' });
    }
    const profileId = profileResult.rows[0].id;

    const result = await query(
      `INSERT INTO professor_awards (profile_id, title, organization, year, description, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [profileId, title, organization, year, description, sort_order || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding award:', error);
    res.status(500).json({ error: 'Failed to add award' });
  }
});

// Update award (admin only)
router.put('/awards/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, organization, year, description, sort_order } = req.body;

    const result = await query(
      `UPDATE professor_awards
       SET title = COALESCE($1, title),
           organization = $2,
           year = $3,
           description = $4,
           sort_order = COALESCE($5, sort_order)
       WHERE id = $6
       RETURNING *`,
      [title, organization, year, description, sort_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Award not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating award:', error);
    res.status(500).json({ error: 'Failed to update award' });
  }
});

// Delete award (admin only)
router.delete('/awards/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM professor_awards WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Award not found' });
    }

    res.json({ message: 'Award deleted successfully' });
  } catch (error) {
    console.error('Error deleting award:', error);
    res.status(500).json({ error: 'Failed to delete award' });
  }
});

export default router;
