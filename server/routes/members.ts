import { Router } from 'express';
import {
  validateSchema,
  memberRegistrationSchema,
  memberUpdateSchema
} from '../middleware/validation';
import { authenticate, authorize } from '../middleware/security';
import * as memberController from '../controllers/memberController';

const router = Router();

/**
 * @route   POST /api/v1/members
 * @desc    Register a new member
 * @access  Public (with rate limiting)
 */
router.post(
  '/',
  validateSchema(memberRegistrationSchema),
  memberController.registerMember
);

/**
 * @route   GET /api/v1/members
 * @desc    Get all members (with pagination and filtering)
 * @access  Private (Recruiter, Researcher, Admin)
 */
router.get(
  '/',
  authenticate,
  authorize('recruiter', 'researcher', 'admin'),
  memberController.getAllMembers
);

/**
 * @route   GET /api/v1/members/:id
 * @desc    Get member by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  memberController.getMemberById
);

/**
 * @route   PUT /api/v1/members/:id
 * @desc    Update member information
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  validateSchema(memberUpdateSchema),
  memberController.updateMember
);

/**
 * @route   DELETE /api/v1/members/:id
 * @desc    Delete/deactivate member
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  memberController.deleteMember
);

/**
 * @route   GET /api/v1/members/:id/applications
 * @desc    Get all applications for a member
 * @access  Private
 */
router.get(
  '/:id/applications',
  authenticate,
  memberController.getMemberApplications
);

/**
 * @route   GET /api/v1/members/search
 * @desc    Search members by criteria
 * @access  Private (Recruiter, Researcher, Admin)
 */
router.get(
  '/search',
  authenticate,
  authorize('recruiter', 'researcher', 'admin'),
  memberController.searchMembers
);

export default router;
