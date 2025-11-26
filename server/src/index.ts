import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { pool, testConnection } from './config/database';
import path from 'path';
import coursesRouter from './routes/courses';
import lecturesRouter from './routes/lectures';
import authRouter from './routes/auth';
import newsRouter from './routes/news';
import booksRouter from './routes/books';
import publicationsRouter from './routes/publications';
import labRouter from './routes/lab';
import profileRouter from './routes/profile';
import uploadRouter from './routes/upload';

dotenv.config();

// Security: Validate required environment variables at startup
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ FATAL: JWT_SECRET must be at least 32 characters');
  process.exit(1);
}

const app: Express = express();
const PORT = process.env.SERVER_PORT || 7341;

// CORS configuration
const allowedOrigins = [
  'http://localhost:7340',
  'https://nahyunjong.com',
  'https://www.nahyunjong.com',
  'https://nahyunjong.co.kr',
  'https://www.nahyunjong.co.kr'
];

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(generalLimiter); // Apply rate limiting to all routes
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? allowedOrigins.filter(o => o.startsWith('https://'))
    : true, // Allow all in development
  credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth/login', authLimiter); // Stricter rate limit for login
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/lectures', lecturesRouter);
app.use('/api/news', newsRouter);
app.use('/api/books', booksRouter);
app.use('/api/publications', publicationsRouter);
app.use('/api/lab', labRouter);
app.use('/api/profile', profileRouter);
app.use('/api/upload', uploadRouter);

// 업로드된 파일 정적 서빙
const uploadDir = process.env.UPLOAD_DIR || '/app/uploads';
app.use('/uploads', express.static(uploadDir));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    console.log('✅ Database connection successful');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
