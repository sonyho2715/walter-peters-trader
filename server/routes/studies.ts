import { Router } from 'express';
import { validateSchema, studyRegistrationSchema } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/security';
import * as studyController from '../controllers/studyController';

const router = Router();

/**
 * @route   POST /api/v1/studies
 * @desc    Create a new study
 * @access  Private (Researcher, Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('researcher', 'admin'),
  validateSchema(studyRegistrationSchema),
  studyController.createStudy
);

/**
 * @route   GET /api/v1/studies
 * @desc    Get all studies
 * @access  Public (filtered by status)
 */
router.get(
  '/',
  studyController.getAllStudies
);

/**
 * @route   GET /api/v1/studies/:id
 * @desc    Get study by ID
 * @access  Public
 */
router.get(
  '/:id',
  studyController.getStudyById
);

/**
 * @route   PUT /api/v1/studies/:id
 * @desc    Update study
 * @access  Private (Researcher, Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('researcher', 'admin'),
  studyController.updateStudy
);

/**
 * @route   DELETE /api/v1/studies/:id
 * @desc    Delete study
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  studyController.deleteStudy
);

/**
 * @route   GET /api/v1/studies/:id/applications
 * @desc    Get all applications for a study
 * @access  Private (Researcher, Admin)
 */
router.get(
  '/:id/applications',
  authenticate,
  authorize('researcher', 'admin'),
  studyController.getStudyApplications
);

/**
 * @route   PATCH /api/v1/studies/:id/status
 * @desc    Update study status
 * @access  Private (Researcher, Admin)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('researcher', 'admin'),
  studyController.updateStudyStatus
);

export default router;
