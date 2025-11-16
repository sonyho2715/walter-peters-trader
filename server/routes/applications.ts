import { Router } from 'express';
import { validateSchema, applicationSchema } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/security';
import * as applicationController from '../controllers/applicationController';

const router = Router();

/**
 * @route   POST /api/v1/applications
 * @desc    Submit a new application
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateSchema(applicationSchema),
  applicationController.submitApplication
);

/**
 * @route   GET /api/v1/applications
 * @desc    Get all applications (with filters)
 * @access  Private (Recruiter, Researcher, Admin)
 */
router.get(
  '/',
  authenticate,
  authorize('recruiter', 'researcher', 'admin'),
  applicationController.getAllApplications
);

/**
 * @route   GET /api/v1/applications/:id
 * @desc    Get application by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  applicationController.getApplicationById
);

/**
 * @route   PATCH /api/v1/applications/:id/status
 * @desc    Update application status
 * @access  Private (Recruiter, Researcher, Admin)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('recruiter', 'researcher', 'admin'),
  applicationController.updateApplicationStatus
);

/**
 * @route   POST /api/v1/applications/:id/review
 * @desc    Review and score an application
 * @access  Private (Researcher, Admin)
 */
router.post(
  '/:id/review',
  authenticate,
  authorize('researcher', 'admin'),
  applicationController.reviewApplication
);

/**
 * @route   POST /api/v1/applications/:id/interview
 * @desc    Schedule interview for application
 * @access  Private (Recruiter, Researcher, Admin)
 */
router.post(
  '/:id/interview',
  authenticate,
  authorize('recruiter', 'researcher', 'admin'),
  applicationController.scheduleInterview
);

export default router;
