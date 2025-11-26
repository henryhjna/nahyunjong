import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all active lab members (public)
router.get('/members', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, name, name_en, batch, is_professor, email, photo_url,
              graduation_year, current_position, linkedin_url, order_index
       FROM lab_members
       WHERE is_active = true
       ORDER BY
         is_professor DESC,
         batch DESC NULLS LAST,
         order_index ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lab members:', error);
    res.status(500).json({ error: 'Failed to fetch lab members' });
  }
});

// Get all lab members including inactive (admin)
router.get('/members/admin/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM lab_members
       ORDER BY
         is_professor DESC,
         batch DESC NULLS LAST,
         order_index ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all lab members:', error);
    res.status(500).json({ error: 'Failed to fetch lab members' });
  }
});

// Get single lab member by ID (admin)
router.get('/members/admin/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM lab_members WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lab member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lab member:', error);
    res.status(500).json({ error: 'Failed to fetch lab member' });
  }
});

// Create lab member (admin only)
router.post('/members', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, name_en, batch, is_professor, email, photo_url,
      graduation_year, current_position, linkedin_url,
      is_active, order_index
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // batch is required for non-professors
    if (!is_professor && !batch) {
      return res.status(400).json({ error: '기수는 필수입니다 (교수 제외)' });
    }

    const result = await query(
      `INSERT INTO lab_members (name, name_en, batch, is_professor, email, photo_url,
                                graduation_year, current_position, linkedin_url,
                                is_active, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, name_en, is_professor ? null : batch, is_professor ?? false, email, photo_url,
       graduation_year, current_position, linkedin_url,
       is_active ?? true, order_index ?? 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating lab member:', error);
    res.status(500).json({ error: 'Failed to create lab member' });
  }
});

// Update lab member (admin only)
router.put('/members/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name, name_en, batch, is_professor, email, photo_url,
      graduation_year, current_position, linkedin_url,
      is_active, order_index
    } = req.body;

    const result = await query(
      `UPDATE lab_members
       SET name = COALESCE($1, name),
           name_en = COALESCE($2, name_en),
           batch = $3,
           is_professor = COALESCE($4, is_professor),
           email = COALESCE($5, email),
           photo_url = COALESCE($6, photo_url),
           graduation_year = COALESCE($7, graduation_year),
           current_position = COALESCE($8, current_position),
           linkedin_url = COALESCE($9, linkedin_url),
           is_active = COALESCE($10, is_active),
           order_index = COALESCE($11, order_index)
       WHERE id = $12
       RETURNING *`,
      [name, name_en, is_professor ? null : batch, is_professor, email, photo_url,
       graduation_year, current_position, linkedin_url,
       is_active, order_index, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lab member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lab member:', error);
    res.status(500).json({ error: 'Failed to update lab member' });
  }
});

// Delete lab member (admin only)
router.delete('/members/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM lab_members WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lab member not found' });
    }

    res.json({ message: 'Lab member deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab member:', error);
    res.status(500).json({ error: 'Failed to delete lab member' });
  }
});

// ========================================
// BATCH DATA (Public)
// ========================================

// Get all batch data with projects and members (public)
router.get('/batches', async (req: Request, res: Response) => {
  try {
    // Execute all independent queries in parallel for better performance
    const [professorResult, batchMetaResult, projectsResult, membersResult] = await Promise.all([
      // Get professor
      query(
        `SELECT id, name, name_en, email, photo_url, linkedin_url
         FROM lab_members
         WHERE is_professor = true AND is_active = true
         LIMIT 1`
      ),
      // Get batch metadata
      query(
        `SELECT batch, hero_image_url, year, description FROM lab_batch_meta`
      ),
      // Get all projects with links
      query(
        `SELECT p.id, p.batch, p.title, p.description, p.order_index,
                COALESCE(
                  json_agg(
                    json_build_object(
                      'id', l.id,
                      'link_type', l.link_type,
                      'url', l.url,
                      'title', l.title
                    ) ORDER BY l.order_index
                  ) FILTER (WHERE l.id IS NOT NULL),
                  '[]'
                ) as links
         FROM lab_projects p
         LEFT JOIN lab_project_links l ON l.project_id = p.id
         WHERE p.is_published = true
         GROUP BY p.id, p.batch, p.title, p.description, p.order_index
         ORDER BY p.batch DESC, p.order_index ASC`
      ),
      // Get all non-professor members
      query(
        `SELECT id, name, name_en, batch, email, photo_url,
                graduation_year, current_position, linkedin_url
         FROM lab_members
         WHERE is_professor = false AND is_active = true AND batch IS NOT NULL
         ORDER BY batch DESC, order_index ASC`
      )
    ]);

    const professor = professorResult.rows[0] || null;

    const batchMetaMap = new Map<number, { hero_image_url: string | null; year: number | null; description: string | null }>();
    for (const meta of batchMetaResult.rows) {
      batchMetaMap.set(meta.batch, {
        hero_image_url: meta.hero_image_url,
        year: meta.year,
        description: meta.description
      });
    }

    // Group by batch
    const batchMap = new Map<number, {
      batch: number;
      hero_image_url: string | null;
      year: number | null;
      description: string | null;
      projects: any[];
      members: any[];
    }>();

    // Add projects to batches
    for (const project of projectsResult.rows) {
      if (!batchMap.has(project.batch)) {
        const meta = batchMetaMap.get(project.batch);
        batchMap.set(project.batch, {
          batch: project.batch,
          hero_image_url: meta?.hero_image_url || null,
          year: meta?.year || null,
          description: meta?.description || null,
          projects: [],
          members: []
        });
      }
      batchMap.get(project.batch)!.projects.push({
        id: project.id,
        title: project.title,
        description: project.description,
        links: project.links
      });
    }

    // Add members to batches
    for (const member of membersResult.rows) {
      if (!batchMap.has(member.batch)) {
        const meta = batchMetaMap.get(member.batch);
        batchMap.set(member.batch, {
          batch: member.batch,
          hero_image_url: meta?.hero_image_url || null,
          year: meta?.year || null,
          description: meta?.description || null,
          projects: [],
          members: []
        });
      }
      batchMap.get(member.batch)!.members.push(member);
    }

    // Convert to sorted array (newest first)
    const batches = Array.from(batchMap.values())
      .sort((a, b) => b.batch - a.batch);

    res.json({ batches, professor });
  } catch (error) {
    console.error('Error fetching batch data:', error);
    res.status(500).json({ error: 'Failed to fetch batch data' });
  }
});

// ========================================
// PROJECTS (Admin)
// ========================================

// Get all projects (admin)
router.get('/projects/admin/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT p.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', l.id,
                    'link_type', l.link_type,
                    'url', l.url,
                    'title', l.title,
                    'order_index', l.order_index
                  ) ORDER BY l.order_index
                ) FILTER (WHERE l.id IS NOT NULL),
                '[]'
              ) as links
       FROM lab_projects p
       LEFT JOIN lab_project_links l ON l.project_id = p.id
       GROUP BY p.id
       ORDER BY p.batch DESC, p.order_index ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create project (admin)
router.post('/projects', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { batch, title, description, is_published, order_index, links } = req.body;

    if (!batch || !title) {
      return res.status(400).json({ error: '기수와 제목은 필수입니다' });
    }

    // Create project
    const projectResult = await query(
      `INSERT INTO lab_projects (batch, title, description, is_published, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [batch, title, description, is_published ?? true, order_index ?? 0]
    );

    const project = projectResult.rows[0];

    // Add links if provided
    if (links && Array.isArray(links) && links.length > 0) {
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        await query(
          `INSERT INTO lab_project_links (project_id, link_type, url, title, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [project.id, link.link_type, link.url, link.title, i]
        );
      }
    }

    // Fetch complete project with links
    const fullResult = await query(
      `SELECT p.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', l.id,
                    'link_type', l.link_type,
                    'url', l.url,
                    'title', l.title,
                    'order_index', l.order_index
                  ) ORDER BY l.order_index
                ) FILTER (WHERE l.id IS NOT NULL),
                '[]'
              ) as links
       FROM lab_projects p
       LEFT JOIN lab_project_links l ON l.project_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [project.id]
    );

    res.status(201).json(fullResult.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project (admin)
router.put('/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { batch, title, description, is_published, order_index, links } = req.body;

    const result = await query(
      `UPDATE lab_projects
       SET batch = COALESCE($1, batch),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           is_published = COALESCE($4, is_published),
           order_index = COALESCE($5, order_index)
       WHERE id = $6
       RETURNING *`,
      [batch, title, description, is_published, order_index, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update links if provided
    if (links !== undefined && Array.isArray(links)) {
      // Delete existing links
      await query('DELETE FROM lab_project_links WHERE project_id = $1', [id]);

      // Add new links
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        await query(
          `INSERT INTO lab_project_links (project_id, link_type, url, title, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, link.link_type, link.url, link.title, i]
        );
      }
    }

    // Fetch complete project with links
    const fullResult = await query(
      `SELECT p.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', l.id,
                    'link_type', l.link_type,
                    'url', l.url,
                    'title', l.title,
                    'order_index', l.order_index
                  ) ORDER BY l.order_index
                ) FILTER (WHERE l.id IS NOT NULL),
                '[]'
              ) as links
       FROM lab_projects p
       LEFT JOIN lab_project_links l ON l.project_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );

    res.json(fullResult.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project (admin)
router.delete('/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM lab_projects WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ========================================
// PROJECT LINKS (Admin)
// ========================================

// Add link to project (admin)
router.post('/projects/:projectId/links', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { link_type, url, title, order_index } = req.body;

    if (!link_type || !url) {
      return res.status(400).json({ error: '링크 타입과 URL은 필수입니다' });
    }

    // Check project exists
    const projectCheck = await query('SELECT id FROM lab_projects WHERE id = $1', [projectId]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const result = await query(
      `INSERT INTO lab_project_links (project_id, link_type, url, title, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [projectId, link_type, url, title, order_index ?? 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding link:', error);
    res.status(500).json({ error: 'Failed to add link' });
  }
});

// Delete link (admin)
router.delete('/project-links/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM lab_project_links WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// ========================================
// BATCH META (Admin)
// ========================================

// Get all batch meta (admin)
router.get('/batch-meta/admin/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM lab_batch_meta ORDER BY batch DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching batch meta:', error);
    res.status(500).json({ error: 'Failed to fetch batch meta' });
  }
});

// Create or update batch meta (admin) - upsert
router.put('/batch-meta/:batch', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { batch } = req.params;
    const { hero_image_url, year, description } = req.body;

    const result = await query(
      `INSERT INTO lab_batch_meta (batch, hero_image_url, year, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (batch) DO UPDATE SET
         hero_image_url = COALESCE($2, lab_batch_meta.hero_image_url),
         year = COALESCE($3, lab_batch_meta.year),
         description = COALESCE($4, lab_batch_meta.description)
       RETURNING *`,
      [batch, hero_image_url, year, description]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating batch meta:', error);
    res.status(500).json({ error: 'Failed to update batch meta' });
  }
});

// Delete batch meta (admin)
router.delete('/batch-meta/:batch', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { batch } = req.params;
    const result = await query('DELETE FROM lab_batch_meta WHERE batch = $1 RETURNING batch', [batch]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch meta not found' });
    }

    res.json({ message: 'Batch meta deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch meta:', error);
    res.status(500).json({ error: 'Failed to delete batch meta' });
  }
});

export default router;
