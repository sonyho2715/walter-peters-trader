import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { body, validationResult, ValidationChain } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

// Zod Schemas for Input Validation
export const memberRegistrationSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name contains invalid characters'),

  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name contains invalid characters'),

  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters')
    .toLowerCase()
    .trim(),

  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164 format)')
    .optional(),

  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const birthDate = new Date(date);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 120;
    }, 'Must be between 18 and 120 years old'),

  address: z.object({
    street: z.string().min(5).max(100),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().length(2, 'Country code must be 2 characters (ISO 3166-1 alpha-2)')
  }).optional(),

  studyInterest: z.array(z.string()).min(1, 'At least one study interest required'),

  consentGiven: z.boolean().refine((val) => val === true, 'Consent must be given'),

  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional()
});

export const memberUpdateSchema = memberRegistrationSchema.partial();

export const studyRegistrationSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maxParticipants: z.number().int().positive().max(10000),
  eligibilityCriteria: z.array(z.string()),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled'])
});

export const applicationSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  studyId: z.string().uuid('Invalid study ID'),
  answers: z.record(z.any()),
  documents: z.array(z.string()).optional()
});

// Middleware for Zod validation
export const validateSchema = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// Express-validator chains
export const memberValidationRules = (): ValidationChain[] => {
  return [
    body('email').isEmail().normalizeEmail().trim().escape(),
    body('firstName').trim().escape().isLength({ min: 2, max: 50 }),
    body('lastName').trim().escape().isLength({ min: 2, max: 50 }),
    body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/),
    body('dateOfBirth').isISO8601().toDate(),
  ];
};

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (value: any): any => {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {}
      });
    }
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).reduce((acc, key) => {
        acc[key] = sanitizeString(value[key]);
        return acc;
      }, {} as any);
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeString(req.body);
  }

  next();
};

// SQL Injection prevention
export const preventSQLInjection = (input: string): string => {
  return input.replace(/['";\\]/g, '');
};

// XSS prevention
export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};
