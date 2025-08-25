const express = require('express');
const router = express.Router();
const db = require('../config/db_conn');


router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM public.cms_stu_scholarship ORDER BY createdat DESC`
    );
    return res.status(200).json({ scholarships: result.rows });
  } catch (err) {
    console.error('Error fetching scholarships:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM public.cms_stu_scholarship WHERE cms_schol_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }
    return res.status(200).json({ scholarship: result.rows[0] });
  } catch (err) {
    console.error('Error fetching scholarship:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/', async (req, res) => {
  const {
    cms_schol_id,
    cms_schol_stuid,
    cms_schol_term_id,
    cms_schol_fee_head,
    cms_stu_schol_amt,
    cms_schol_reason,
    cms_schol_apprved_by
  } = req.body;

  if (!cms_schol_id || !cms_schol_stuid || !cms_schol_fee_head) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const result = await db.query(
      `INSERT INTO public.cms_stu_scholarship (
        cms_schol_id, cms_schol_stuid, cms_schol_term_id, cms_schol_fee_head,
        cms_stu_schol_amt, cms_schol_reason, cms_schol_apprved_by,
        createdat, updatedat
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7, NOW(), NOW()
      ) RETURNING *`,
      [
        cms_schol_id,
        cms_schol_stuid,
        cms_schol_term_id,
        cms_schol_fee_head,
        cms_stu_schol_amt,
        cms_schol_reason,
        cms_schol_apprved_by
      ]
    );
    return res.status(201).json({ message: 'Scholarship added', scholarship: result.rows[0] });
  } catch (err) {
    console.error('Error adding scholarship:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    cms_schol_stuid,
    cms_schol_term_id,
    cms_schol_fee_head,
    cms_stu_schol_amt,
    cms_schol_reason,
    cms_schol_apprved_by
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE public.cms_stu_scholarship SET
        cms_schol_stuid = $1,
        cms_schol_term_id = $2,
        cms_schol_fee_head = $3,
        cms_stu_schol_amt = $4,
        cms_schol_reason = $5,
        cms_schol_apprved_by = $6,
        updatedat = NOW()
      WHERE cms_schol_id = $7
      RETURNING *`,
      [
        cms_schol_stuid,
        cms_schol_term_id,
        cms_schol_fee_head,
        cms_stu_schol_amt,
        cms_schol_reason,
        cms_schol_apprved_by,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    return res.status(200).json({ message: 'Scholarship updated', scholarship: result.rows[0] });
  } catch (err) {
    console.error('Error updating scholarship:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `DELETE FROM public.cms_stu_scholarship WHERE cms_schol_id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }
    return res.status(200).json({ message: 'Scholarship deleted', scholarship: result.rows[0] });
  } catch (err) {
    console.error('Error deleting scholarship:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
