import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/security';

export const submitApplication = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { memberId, studyId, answers, documents } = req.body;

    // Check if study is still accepting applications
    const study = await client.query(
      'SELECT status, max_participants, current_participants FROM studies WHERE id = $1',
      [studyId]
    );

    if (study.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    if (study.rows[0].status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Study is not currently accepting applications'
      });
    }

    if (study.rows[0].current_participants >= study.rows[0].max_participants) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Study has reached maximum participants'
      });
    }

    // Check for existing application
    const existing = await client.query(
      'SELECT id FROM applications WHERE member_id = $1 AND study_id = $2',
      [memberId, studyId]
    );

    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        error: 'Application already exists for this study'
      });
    }

    // Create application
    const result = await client.query(
      `INSERT INTO applications (member_id, study_id, application_data, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [memberId, studyId, JSON.stringify(answers), 'submitted']
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Application submitted successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application'
    });
  } finally {
    client.release();
  }
};

export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string;
    const studyId = req.query.studyId as string;

    let query = `
      SELECT a.*, m.first_name, m.last_name, m.email, s.title as study_title
      FROM applications a
      JOIN members m ON a.member_id = m.id
      JOIN studies s ON a.study_id = s.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push(`a.status = $${params.length + 1}`);
      params.push(status);
    }

    if (studyId) {
      conditions.push(`a.study_id = $${params.length + 1}`);
      params.push(studyId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY a.submitted_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, m.*, s.title as study_title, s.description as study_description
       FROM applications a
       JOIN members m ON a.member_id = m.id
       JOIN studies s ON a.study_id = s.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch application'
    });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const result = await pool.query(
      `UPDATE applications
       SET status = $1, decision_notes = $2, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $3
       WHERE id = $4
       RETURNING *`,
      [status, notes, req.user?.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Application status updated successfully'
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application status'
    });
  }
};

export const reviewApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { score, notes, decision } = req.body;

    const result = await pool.query(
      `UPDATE applications
       SET screening_score = $1, decision_notes = $2, status = $3,
           reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $4
       WHERE id = $5
       RETURNING *`,
      [score, notes, decision, req.user?.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Application reviewed successfully'
    });

  } catch (error) {
    console.error('Error reviewing application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review application'
    });
  }
};

export const scheduleInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { interviewDate, location, notes } = req.body;

    const result = await pool.query(
      `UPDATE applications
       SET interview_date = $1, interview_location = $2, interview_notes = $3, status = 'interview_scheduled'
       WHERE id = $4
       RETURNING *`,
      [interviewDate, location, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Interview scheduled successfully'
    });

  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule interview'
    });
  }
};
