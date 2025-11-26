import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

const router = express.Router();

// Admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    console.log('Login attempt:', { email, username, hasPassword: !!password, body: req.body });

    if ((!email && !username) || !password) {
      console.log('Missing credentials:', { hasEmail: !!email, hasUsername: !!username, hasPassword: !!password });
      return res.status(400).json({ error: 'Email/username and password required' });
    }

    // Get admin from database (allow login with either email or username)
    const result = await query(
      'SELECT * FROM admins WHERE email = $1 OR username = $1',
      [email || username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT (1 hour expiry for better security)
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    // Get fresh admin data from database
    const result = await query('SELECT id, username, email FROM admins WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      valid: true,
      admin: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
