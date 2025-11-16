import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter for validation
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    files: 5 // Max 5 files per request
  }
});

// Validate uploaded files
export const validateUploadedFile = (file: Express.Multer.File): {
  valid: boolean;
  error?: string;
} => {
  // Check file size
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880');
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds maximum allowed' };
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: 'Invalid file extension' };
  }

  // Additional security: Check magic numbers (file signatures)
  // This would require reading the file buffer - implement as needed

  return { valid: true };
};
