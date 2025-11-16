import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/security';

export const registerMember = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      studyInterest,
      consentGiven,
      notes
    } = req.body;

    // Check if member already exists
    const existingMember = await client.query(
      'SELECT id FROM members WHERE email = $1',
      [email]
    );

    if (existingMember.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        error: 'Member with this email already exists'
      });
    }

    // Insert new member
    const result = await client.query(
      `INSERT INTO members (
        first_name, last_name, email, phone, date_of_birth,
        street, city, state, zip_code, country,
        study_interests, consent_given, consent_date, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, first_name, last_name, email, created_at`,
      [
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        address?.street,
        address?.city,
        address?.state,
        address?.zipCode,
        address?.country,
        studyInterest,
        consentGiven,
        consentGiven ? new Date() : null,
        notes,
        'active'
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Member registered successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error registering member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register member'
    });
  } finally {
    client.release();
  }
};

export const getAllMembers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let query = 'SELECT * FROM members';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countQuery = status
      ? 'SELECT COUNT(*) FROM members WHERE status = $1'
      : 'SELECT COUNT(*) FROM members';
    const countResult = await pool.query(countQuery, status ? [status] : []);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch members'
    });
  }
};

export const getMemberById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM members WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch member'
    });
  }
};

export const updateMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const result = await pool.query(
      `UPDATE members SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Member updated successfully'
    });

  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update member'
    });
  }
};

export const deleteMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete - set status to inactive
    const result = await pool.query(
      'UPDATE members SET status = $1 WHERE id = $2 RETURNING id',
      ['inactive', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete member'
    });
  }
};

export const getMemberApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, s.title as study_title, s.protocol_number
       FROM applications a
       JOIN studies s ON a.study_id = s.id
       WHERE a.member_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching member applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
};

export const searchMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;

    const result = await pool.query(
      `SELECT * FROM members
       WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [`%${query}%`]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error searching members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search members'
    });
  }
};
