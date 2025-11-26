import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// 업로드 디렉토리 설정
const uploadDir = process.env.UPLOAD_DIR || '/app/uploads';

// 카테고리별 디렉토리 매핑
const categoryDirs: Record<string, string> = {
  'profile': 'profile',
  'books': 'books',
  'lab-members': 'lab-members',
  'lab-batches': 'lab-batches',
};

// multer 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.params.category;
    const categoryDir = categoryDirs[category];

    if (!categoryDir) {
      return cb(new Error('Invalid category'), '');
    }

    const dir = path.join(uploadDir, categoryDir);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});

// 파일 필터: 이미지만 허용
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('허용되지 않는 파일 형식입니다. JPEG, PNG, WebP, GIF만 업로드 가능합니다.'));
  }
};

// multer 설정
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// 이미지 업로드 엔드포인트
router.post('/:category', requireAuth, (req: AuthRequest, res: Response) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: '파일 크기는 5MB를 초과할 수 없습니다.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
    }

    const category = req.params.category;
    const imageUrl = `/uploads/${categoryDirs[category]}/${req.file.filename}`;
    res.json({ url: imageUrl });
  });
});

// 이미지 삭제 엔드포인트
router.delete('/:category/:filename', requireAuth, (req: AuthRequest, res: Response) => {
  const { category, filename } = req.params;
  const categoryDir = categoryDirs[category];

  if (!categoryDir) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  // 파일명 검증 (path traversal 방지)
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const filePath = path.join(uploadDir, categoryDir, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
      }
      console.error('File delete error:', err);
      return res.status(500).json({ error: '파일 삭제 중 오류가 발생했습니다.' });
    }
    res.json({ success: true });
  });
});

export default router;
