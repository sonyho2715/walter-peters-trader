import { Router } from 'express';
import { authenticate, authorize } from '../middleware/security';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

/**
 * @route   GET /api/v1/dashboard/metrics
 * @desc    Get dashboard metrics and KPIs
 * @access  Private (Recruiter, Researcher, Admin)
 */
router.get(
  '/metrics',
  authenticate,
  authorize('recruiter', 'researcher', 'admin'),
  dashboardController.getDashboardMetrics
);

/**
 * @route   GET /api/v1/dashboard/analytics
 * @desc    Get detailed analytics
 * @access  Private (Researcher, Admin)
 */
router.get(
  '/analytics',
  authenticate,
  authorize('researcher', 'admin'),
  dashboardController.getAnalytics
);

/**
 * @route   GET /api/v1/dashboard/recruitment-funnel
 * @desc    Get recruitment funnel data
 * @access  Private (Recruiter, Researcher, Admin)
 */
router.get(
  '/recruitment-funnel',
  authenticate,
  authorize('recruiter', 'researcher', 'admin'),
  dashboardController.getRecruitmentFunnel
);

/**
 * @route   GET /api/v1/dashboard/recent-activity
 * @desc    Get recent activity feed
 * @access  Private
 */
router.get(
  '/recent-activity',
  authenticate,
  dashboardController.getRecentActivity
);

export default router;
