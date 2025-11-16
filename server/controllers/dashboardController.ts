import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/security';

export const getDashboardMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await pool.query('SELECT * FROM dashboard_metrics');

    // Additional real-time metrics
    const recentApplications = await pool.query(
      `SELECT COUNT(*) as count
       FROM applications
       WHERE submitted_at >= CURRENT_DATE - INTERVAL '7 days'`
    );

    const topStudies = await pool.query(
      `SELECT s.title, COUNT(a.id) as application_count
       FROM studies s
       LEFT JOIN applications a ON s.id = a.study_id
       WHERE s.status = 'active'
       GROUP BY s.id, s.title
       ORDER BY application_count DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        ...metrics.rows[0],
        recent_applications_7d: parseInt(recentApplications.rows[0].count),
        top_studies: topStudies.rows
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard metrics'
    });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Member demographics
    const demographics = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE gender = 'male') as male_count,
        COUNT(*) FILTER (WHERE gender = 'female') as female_count,
        COUNT(*) FILTER (WHERE gender = 'other') as other_count,
        AVG(EXTRACT(YEAR FROM age(date_of_birth))) as avg_age
       FROM members
       WHERE status = 'active'`
    );

    // Application status breakdown
    const applicationStats = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM applications
       GROUP BY status
       ORDER BY count DESC`
    );

    // Monthly trends
    const monthlyTrends = await pool.query(
      `SELECT
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as member_count
       FROM members
       WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY month
       ORDER BY month`
    );

    // Conversion rates by stage
    const conversionRates = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'submitted') as submitted,
        COUNT(*) FILTER (WHERE status = 'under_review') as under_review,
        COUNT(*) FILTER (WHERE status = 'screening') as screening,
        COUNT(*) FILTER (WHERE status = 'interview_scheduled') as interview,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
       FROM applications`
    );

    res.json({
      success: true,
      data: {
        demographics: demographics.rows[0],
        application_stats: applicationStats.rows,
        monthly_trends: monthlyTrends.rows,
        conversion_rates: conversionRates.rows[0]
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};

export const getRecruitmentFunnel = async (req: AuthRequest, res: Response) => {
  try {
    const funnel = await pool.query(
      `SELECT
        COUNT(DISTINCT m.id) as total_members,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'under_review') as in_review,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'screening') as in_screening,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'interview_scheduled') as interviews,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'approved') as approved,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') as completed
       FROM members m
       LEFT JOIN applications a ON m.id = a.member_id
       WHERE m.status = 'active'`
    );

    const funnelData = funnel.rows[0];

    // Calculate conversion percentages
    const totalApplications = parseInt(funnelData.total_applications) || 1;
    const conversions = {
      application_rate: ((totalApplications / parseInt(funnelData.total_members)) * 100).toFixed(2),
      review_rate: ((parseInt(funnelData.in_review) / totalApplications) * 100).toFixed(2),
      screening_rate: ((parseInt(funnelData.in_screening) / totalApplications) * 100).toFixed(2),
      interview_rate: ((parseInt(funnelData.interviews) / totalApplications) * 100).toFixed(2),
      approval_rate: ((parseInt(funnelData.approved) / totalApplications) * 100).toFixed(2),
      completion_rate: ((parseInt(funnelData.completed) / totalApplications) * 100).toFixed(2)
    };

    res.json({
      success: true,
      data: {
        funnel: funnelData,
        conversions
      }
    });

  } catch (error) {
    console.error('Error fetching recruitment funnel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recruitment funnel'
    });
  }
};

export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const activities = await pool.query(
      `SELECT
        'application' as type,
        a.id,
        a.created_at as timestamp,
        m.first_name || ' ' || m.last_name as member_name,
        s.title as study_title,
        a.status
       FROM applications a
       JOIN members m ON a.member_id = m.id
       JOIN studies s ON a.study_id = s.id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: activities.rows
    });

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity'
    });
  }
};
