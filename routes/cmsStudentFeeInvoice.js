const express = require('express');
const router = express.Router();
const db = require('../config/db_conn');


router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM public.cms_stu_fee_invoice ORDER BY createdat DESC`
    );
    return res.status(200).json({ invoices: result.rows });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM public.cms_stu_fee_invoice WHERE cms_stu_inv_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    return res.status(200).json({ invoice: result.rows[0] });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/', async (req, res) => {
  const {
    cms_stu_inv_id,
    cms_stu_id,
    cms_term_id,
    cms_fee_head,
    cms_fee_amt,
    cms_due_dt,
    cmc_fee_is_paid,
    cmc_fee_paiddt,
    cmc_fee_pymt_mode,
    cmc_fee_trans_id,
    cmc_stu_fee_remarks
  } = req.body;

  if (!cms_stu_inv_id || !cms_stu_id || !cms_term_id || !cms_fee_head) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const result = await db.query(
      `INSERT INTO public.cms_stu_fee_invoice (
        cms_stu_inv_id, cms_stu_id, cms_term_id, cms_fee_head, cms_fee_amt,
        cms_due_dt, cmc_fee_is_paid, cmc_fee_paiddt, cmc_fee_pymt_mode,
        cmc_fee_trans_id, cmc_stu_fee_remarks, createdat, updatedat
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW()
      ) RETURNING *`,
      [
        cms_stu_inv_id,
        cms_stu_id,
        cms_term_id,
        cms_fee_head,
        cms_fee_amt,
        cms_due_dt,
        cmc_fee_is_paid ?? false,
        cmc_fee_paiddt,
        cmc_fee_pymt_mode,
        cmc_fee_trans_id,
        cmc_stu_fee_remarks
      ]
    );
    return res.status(201).json({ message: 'Invoice created', invoice: result.rows[0] });
  } catch (err) {
    console.error('Error adding invoice:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    cms_stu_id,
    cms_term_id,
    cms_fee_head,
    cms_fee_amt,
    cms_due_dt,
    cmc_fee_is_paid,
    cmc_fee_paiddt,
    cmc_fee_pymt_mode,
    cmc_fee_trans_id,
    cmc_stu_fee_remarks
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE public.cms_stu_fee_invoice SET
        cms_stu_id = $1,
        cms_term_id = $2,
        cms_fee_head = $3,
        cms_fee_amt = $4,
        cms_due_dt = $5,
        cmc_fee_is_paid = $6,
        cmc_fee_paiddt = $7,
        cmc_fee_pymt_mode = $8,
        cmc_fee_trans_id = $9,
        cmc_stu_fee_remarks = $10,
        updatedat = NOW()
      WHERE cms_stu_inv_id = $11
      RETURNING *`,
      [
        cms_stu_id,
        cms_term_id,
        cms_fee_head,
        cms_fee_amt,
        cms_due_dt,
        cmc_fee_is_paid,
        cmc_fee_paiddt,
        cmc_fee_pymt_mode,
        cmc_fee_trans_id,
        cmc_stu_fee_remarks,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.status(200).json({ message: 'Invoice updated', invoice: result.rows[0] });
  } catch (err) {
    console.error('Error updating invoice:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `DELETE FROM public.cms_stu_fee_invoice WHERE cms_stu_inv_id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    return res.status(200).json({ message: 'Invoice deleted', invoice: result.rows[0] });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
