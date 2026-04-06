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
      'SELECT id, name, name_en, title, title_en, affiliation, affiliation_en, email, photo_url, bio, bio_en, research_interests, tagline, tagline_en FROM professor_profile ORDER BY id LIMIT 1'
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
      name, name_en, title, title_en, affiliation, affiliation_en, email, photo_url, bio, bio_en, bio_detail, bio_detail_en, research_interests, tagline, tagline_en
    } = req.body;

    // Get existing profile id
    const existingProfile = await query('SELECT id FROM professor_profile ORDER BY id LIMIT 1');

    if (existingProfile.rows.length === 0) {
      // Create new profile if none exists
      const result = await query(
        `INSERT INTO professor_profile (name, name_en, title, title_en, affiliation, affiliation_en, email, photo_url, bio, bio_en, bio_detail, bio_detail_en, research_interests, tagline, tagline_en)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *`,
        [name, name_en, title, title_en, affiliation, affiliation_en, email, photo_url, bio, bio_en, bio_detail, bio_detail_en, research_interests || [], tagline, tagline_en]
      );
      return res.json(result.rows[0]);
    }

    const profileId = existingProfile.rows[0].id;
    const result = await query(
      `UPDATE professor_profile
       SET name = COALESCE($1, name),
           name_en = $2,
           title = $3,
           title_en = $4,
           affiliation = $5,
           affiliation_en = $6,
           email = $7,
           photo_url = $8,
           bio = $9,
           bio_en = $10,
           bio_detail = $11,
           bio_detail_en = $12,
           research_interests = COALESCE($13, research_interests),
           tagline = $14,
           tagline_en = $15,
           updated_at = NOW()
       WHERE id = $16
       RETURNING *`,
      [name, name_en, title, title_en, affiliation, affiliation_en, email, photo_url, bio, bio_en, bio_detail, bio_detail_en, research_interests, tagline, tagline_en, profileId]
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
    const { degree, degree_en, field, field_en, institution, institution_en, year_start, year_end, description, description_en, sort_order } = req.body;

    // Get profile id
    const profileResult = await query('SELECT id FROM professor_profile ORDER BY id LIMIT 1');
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found. Create profile first.' });
    }
    const profileId = profileResult.rows[0].id;

    const result = await query(
      `INSERT INTO professor_education (profile_id, degree, degree_en, field, field_en, institution, institution_en, year_start, year_end, description, description_en, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [profileId, degree, degree_en, field, field_en, institution, institution_en, year_start, year_end, description, description_en, sort_order || 0]
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
    const { degree, degree_en, field, field_en, institution, institution_en, year_start, year_end, description, description_en, sort_order } = req.body;

    const result = await query(
      `UPDATE professor_education
       SET degree = COALESCE($1, degree),
           degree_en = $2,
           field = $3,
           field_en = $4,
           institution = COALESCE($5, institution),
           institution_en = $6,
           year_start = $7,
           year_end = $8,
           description = $9,
           description_en = $10,
           sort_order = COALESCE($11, sort_order)
       WHERE id = $12
       RETURNING *`,
      [degree, degree_en, field, field_en, institution, institution_en, year_start, year_end, description, description_en, sort_order, id]
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
    const { position, position_en, organization, organization_en, year_start, year_end, is_current, description, description_en, sort_order } = req.body;

    // Get profile id
    const profileResult = await query('SELECT id FROM professor_profile ORDER BY id LIMIT 1');
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found. Create profile first.' });
    }
    const profileId = profileResult.rows[0].id;

    const result = await query(
      `INSERT INTO professor_career (profile_id, position, position_en, organization, organization_en, year_start, year_end, is_current, description, description_en, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [profileId, position, position_en, organization, organization_en, year_start, year_end, is_current || false, description, description_en, sort_order || 0]
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
    const { position, position_en, organization, organization_en, year_start, year_end, is_current, description, description_en, sort_order } = req.body;

    const result = await query(
      `UPDATE professor_career
       SET position = COALESCE($1, position),
           position_en = $2,
           organization = COALESCE($3, organization),
           organization_en = $4,
           year_start = $5,
           year_end = $6,
           is_current = COALESCE($7, is_current),
           description = $8,
           description_en = $9,
           sort_order = COALESCE($10, sort_order)
       WHERE id = $11
       RETURNING *`,
      [position, position_en, organization, organization_en, year_start, year_end, is_current, description, description_en, sort_order, id]
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
    const { title, title_en, organization, organization_en, year, description, description_en, sort_order } = req.body;

    // Get profile id
    const profileResult = await query('SELECT id FROM professor_profile ORDER BY id LIMIT 1');
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found. Create profile first.' });
    }
    const profileId = profileResult.rows[0].id;

    const result = await query(
      `INSERT INTO professor_awards (profile_id, title, title_en, organization, organization_en, year, description, description_en, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [profileId, title, title_en, organization, organization_en, year, description, description_en, sort_order || 0]
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
    const { title, title_en, organization, organization_en, year, description, description_en, sort_order } = req.body;

    const result = await query(
      `UPDATE professor_awards
       SET title = COALESCE($1, title),
           title_en = $2,
           organization = $3,
           organization_en = $4,
           year = $5,
           description = $6,
           description_en = $7,
           sort_order = COALESCE($8, sort_order)
       WHERE id = $9
       RETURNING *`,
      [title, title_en, organization, organization_en, year, description, description_en, sort_order, id]
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
