import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/security';

export const createStudy = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      maxParticipants,
      eligibilityCriteria,
      status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO studies (
        title, description, start_date, end_date,
        max_participants, eligibility_criteria, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        title,
        description,
        startDate,
        endDate,
        maxParticipants,
        JSON.stringify(eligibilityCriteria),
        status,
        req.user?.id
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Study created successfully'
    });

  } catch (error) {
    console.error('Error creating study:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create study'
    });
  }
};

export const getAllStudies = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM studies';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching studies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studies'
    });
  }
};

export const getStudyById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM studies WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching study:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch study'
    });
  }
};

export const updateStudy = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const result = await pool.query(
      `UPDATE studies SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Study updated successfully'
    });

  } catch (error) {
    console.error('Error updating study:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update study'
    });
  }
};

export const deleteStudy = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM studies WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    res.json({
      success: true,
      message: 'Study deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting study:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete study'
    });
  }
};

export const getStudyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, m.first_name, m.last_name, m.email
       FROM applications a
       JOIN members m ON a.member_id = m.id
       WHERE a.study_id = $1
       ORDER BY a.submitted_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching study applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
};

export const updateStudyStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE studies SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Study not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Study status updated successfully'
    });

  } catch (error) {
    console.error('Error updating study status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update study status'
    });
  }
};
