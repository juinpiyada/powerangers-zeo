const express = require('express');
const router = express.Router();
const db = require('../config/db_conn');


router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM public.cms_fee_structure ORDER BY createdat DESC`
    );
    return res.status(200).json({ feeStructures: result.rows });
  } catch (err) {
    console.error('Error fetching fee structures:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM public.cms_fee_structure WHERE fee_struct_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fee Structure not found' });
    }
    return res.status(200).json({ feeStructure: result.rows[0] });
  } catch (err) {
    console.error('Error fetching fee structure:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/', async (req, res) => {
  const {
    fee_struct_id,
    fee_prg_id,
    fee_acad_year,
    fee_semester_no,
    fee_head,
    fee_amount,
    fee_is_mandatory,
    fee_due_dt,
    fee_remarks
  } = req.body;

  if (!fee_struct_id || !fee_prg_id || !fee_head) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const result = await db.query(
      `INSERT INTO public.cms_fee_structure (
        fee_struct_id, fee_prg_id, fee_acad_year, fee_semester_no,
        fee_head, fee_amount, fee_is_mandatory, fee_due_dt, fee_remarks,
        createdat, updatedat
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9, NOW(), NOW()
      ) RETURNING *`,
      [
        fee_struct_id,
        fee_prg_id,
        fee_acad_year,
        fee_semester_no,
        fee_head,
        fee_amount,
        fee_is_mandatory ?? true,
        fee_due_dt,
        fee_remarks
      ]
    );
    return res.status(201).json({ message: 'Fee Structure added', feeStructure: result.rows[0] });
  } catch (err) {
    console.error('Error adding fee structure:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    fee_prg_id,
    fee_acad_year,
    fee_semester_no,
    fee_head,
    fee_amount,
    fee_is_mandatory,
    fee_due_dt,
    fee_remarks
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE public.cms_fee_structure SET
        fee_prg_id = $1,
        fee_acad_year = $2,
        fee_semester_no = $3,
        fee_head = $4,
        fee_amount = $5,
        fee_is_mandatory = $6,
        fee_due_dt = $7,
        fee_remarks = $8,
        updatedat = NOW()
      WHERE fee_struct_id = $9
      RETURNING *`,
      [
        fee_prg_id,
        fee_acad_year,
        fee_semester_no,
        fee_head,
        fee_amount,
        fee_is_mandatory,
        fee_due_dt,
        fee_remarks,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Fee Structure not found' });
    }

    return res.status(200).json({ message: 'Fee Structure updated', feeStructure: result.rows[0] });
  } catch (err) {
    console.error('Error updating fee structure:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `DELETE FROM public.cms_fee_structure WHERE fee_struct_id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Fee Structure not found' });
    }
    return res.status(200).json({ message: 'Fee Structure deleted', feeStructure: result.rows[0] });
  } catch (err) {
    console.error('Error deleting fee structure:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
