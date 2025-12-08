// routes/master_fetcher.js
// =============================================================
// MASTER FETCHER API
// - Fetch ALL columns from allowed tables (SELECT *)
// - Fetch all tables together OR one table
// - Safe allow-list (prevents SQL injection for table names)
// - Supports: ?tables=a,b,c  ?limit=100 ?offset=0
// - Optional: ?include_blobs=0  (removes *_base64 fields from response)
// =============================================================

const express = require("express");
const router = express.Router();
const db = require("../config/db_conn");

// ------- Allowed tables (add/remove as needed) -------
// NOTE: key is your API name; table is the real PostgreSQL table name.
const TABLES = [
  // 1
  { key: "announcements", table: "announcements", order: ["created_at", "id"] },

  // 2
  { key: "audit_log", table: "audit_log", order: ["created_at", "event_timestamp", "id"] },

  // 3
  { key: "ay_2025_2026", table: "ay_2025_2026", order: ["updated_at", "created_at", "stuid"] },

  // 4
  { key: "campus_activity_report", table: "campus_activity_report", order: ["updated_at", "created_at", "activity_id"] },

  // 5
  { key: "cms_fee_structure", table: "cms_fee_structure", order: ["updatedat", "createdat", "fee_struct_id"] },

  // 6
  { key: "cms_stu_fee_invoice", table: "cms_stu_fee_invoice", order: ["updatedat", "createdat", "cms_stu_inv_id"] },

  // 7
  { key: "cms_stu_payments", table: "cms_stu_payments", order: ["updatedat", "createdat", "cms_pymts_tran_id"] },

  // 8
  { key: "cms_stu_scholarship", table: "cms_stu_scholarship", order: ["updatedat", "createdat", "cms_schol_id"] },

  // 9
  { key: "college_acad_year", table: "college_acad_year", order: ["updatedat", "createdat", "id"] },

  // 10
  { key: "college_attendance", table: "college_attendance", order: ["updatedat", "createdat", "attid"] },

  // 11
  { key: "college_classroom", table: "college_classroom", order: ["updatedat", "createdat", "classroomid"] },

  // 12
  { key: "college_course_offering", table: "college_course_offering", order: ["updatedat", "createdat", "offerid"] },

  // 13
  { key: "college_course_regis", table: "college_course_regis", order: ["updatedat", "createdat", "course_regis_id"] },

  // 14
  { key: "college_daily_routine", table: "college_daily_routine", order: ["updatedat", "createdat", "routineid"] },

  // 15
  { key: "college_depts", table: "college_depts", order: ["updatedat", "createdat", "collegedeptid"] },

  // 16
  { key: "college_exam_result", table: "college_exam_result", order: ["updatedat", "createdat", "examresultid"] },

  // 17
  { key: "college_exam_routine", table: "college_exam_routine", order: ["updatedat", "createdat", "examid"] },

  // 18
  { key: "employee_attendance", table: "employee_attendance", order: ["updatedat", "createdat", "attid"] },

  // 19
  { key: "events", table: "events", order: ["created_at", "id"] },

  // 20
  { key: "fin_master_student", table: "fin_master_student", order: ["updatedat", "createdat", "stuid"] },

  // 21
  { key: "hostel_fee_ledger_48_v2", table: "hostel_fee_ledger_48_v2", order: ["updated_at", "created_at", "account_id"] },

  // 22
  { key: "leave_application", table: "leave_application", order: ["updated_at", "submitted_at", "id"] },

  // 23
  { key: "master_college", table: "master_college", order: ["updatedat", "createdat", "collegeid"] },

  // 24
  { key: "master_college_group", table: "master_college_group", order: ["updatedat", "createdat", "groupid"] },

  // 25
  { key: "master_course", table: "master_course", order: ["updatedat", "createdat", "courseid"] },

  // 26
  { key: "master_role", table: "master_role", order: ["updatedat", "createdat", "role_id"] },

  // 27
  { key: "master_subject", table: "master_subject", order: ["updatedat", "createdat", "subjectid"] },

  // 28
  { key: "master_teacher", table: "master_teacher", order: ["updatedat", "createdat", "teacherid"] },

  // 29
  { key: "master_user", table: "master_user", order: ["updatedat", "createdat", "userid"] },

  // 30
  { key: "menu_master", table: "menu_master", order: ["updatedat", "createdat", "menuid"] },

  // 31
  { key: "notices", table: "notices", order: ["created_at", "id"] },

  // 32
  { key: "sms_device", table: "sms_device", order: ["device_id"] },

  // 33
  { key: "student_information", table: "student_information", order: ["updatedat", "createdat", "stuid"] },

  // 34
  { key: "student_master", table: "student_master", order: ["updatedat", "createdat", "stuid"] },

  // 35
  { key: "subject_course", table: "subject_course", order: ["updatedat", "createdat", "sub_cou_id"] },

  // 36
  { key: "subject_elec", table: "subject_elec", order: ["updatedat", "createdat", "sub_elec_id"] },

  // 37
  { key: "subject_teacher", table: "subject_teacher", order: ["updatedat", "createdat", "subteaid"] },

  // 38
  { key: "teacher_availbility", table: "teacher_availbility", order: ["updatedat", "createdat", "teaacheravlid"] },

  // 39
  { key: "teacher_dtls", table: "teacher_dtls", order: ["tchr_dtls_id"] },

  // 40
  { key: "teacher_information", table: "teacher_information", order: ["updatedat", "createdat", "teacherinfoid"] },

  // 41
  { key: "user_dtls", table: "user_dtls", order: ["usr_dtls_id"] },

  // 42
  { key: "user_role", table: "user_role", order: ["updatedat", "createdat", "userid"] },

  // 43
  { key: "whiteboard_cms_theme", table: "whiteboard_cms_theme", order: ["id"] },
];

const TABLE_MAP = Object.fromEntries(TABLES.map((t) => [t.key, t]));

// ------- helpers -------
function toInt(v, def, min, max) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(n, min), max);
}

function pickOrderClause(orderCols = []) {
  if (!orderCols.length) return "";

  // Prefer updated+created combo when present
  if (orderCols.includes("updatedat") && orderCols.includes("createdat")) {
    return `ORDER BY COALESCE(updatedat, createdat) DESC NULLS LAST`;
  }
  if (orderCols.includes("updated_at") && orderCols.includes("created_at")) {
    return `ORDER BY COALESCE(updated_at, created_at) DESC NULLS LAST`;
  }

  // Otherwise, first declared column
  return `ORDER BY ${orderCols[0]} DESC NULLS LAST`;
}

function removeBlobFields(rows) {
  // drops big fields like *_base64 (optional)
  return rows.map((r) => {
    const x = { ...r };
    for (const k of Object.keys(x)) {
      const lk = k.toLowerCase();
      if (lk.endsWith("_base64")) delete x[k];
      if (lk.includes("doc_base64")) delete x[k];
      if (lk.includes("image_base64")) delete x[k];
      if (lk.includes("photo_base64")) delete x[k];
      if (lk.includes("file_base64")) delete x[k];
    }
    return x;
  });
}

// =============================================================
// GET /api/master/fetch-all
// Examples:
// 1) /api/master/fetch-all
// 2) /api/master/fetch-all?tables=announcements,audit_log&limit=50
// 3) /api/master/fetch-all?limit=200&offset=0&include_blobs=1
// 4) /api/master/fetch-all?include_blobs=0
// =============================================================
router.get("/fetch-all", async (req, res) => {
  const limit = toInt(req.query.limit, 100, 1, 5000);
  const offset = toInt(req.query.offset, 0, 0, 100000000);
  const includeBlobs = String(req.query.include_blobs ?? "1") !== "0";

  const requested = String(req.query.tables || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const selectedKeys = requested.length
    ? requested.filter((k) => TABLE_MAP[k])
    : TABLES.map((t) => t.key);

  const invalidKeys = requested.filter((k) => !TABLE_MAP[k]);

  try {
    const meta = {};
    const data = {};

    const tasks = selectedKeys.map(async (key) => {
      const cfg = TABLE_MAP[key];
      const orderClause = pickOrderClause(cfg.order);

      // IMPORTANT: table name comes ONLY from allow-list (safe).
      const sql = `
        SELECT * FROM public.${cfg.table}
        ${orderClause}
        LIMIT $1 OFFSET $2
      `;

      try {
        const r = await db.query(sql, [limit, offset]);
        let rows = r?.rows || [];
        if (!includeBlobs) rows = removeBlobFields(rows);

        data[key] = rows;
        meta[key] = {
          ok: true,
          table: cfg.table,
          rows: rows.length,
          limit,
          offset,
          include_blobs: includeBlobs,
        };
      } catch (e) {
        data[key] = [];
        meta[key] = {
          ok: false,
          table: cfg.table,
          error: e?.message || String(e),
        };
      }
    });

    await Promise.all(tasks);

    return res.status(200).json({
      ok: true,
      ts: new Date().toISOString(),
      table_count: selectedKeys.length,
      tables: selectedKeys,
      invalid_tables: invalidKeys,
      meta,
      data,
    });
  } catch (err) {
    console.error("master/fetch-all error:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch master data",
    });
  }
});

// =============================================================
// GET /api/master/fetch/:key
// Example: /api/master/fetch/announcements?limit=100&offset=0
// =============================================================
router.get("/fetch/:key", async (req, res) => {
  const key = String(req.params.key || "").trim();
  const cfg = TABLE_MAP[key];

  if (!cfg) {
    return res.status(400).json({
      ok: false,
      error: `Invalid table key: ${key}`,
      allowed: TABLES.map((t) => t.key),
    });
  }

  const limit = toInt(req.query.limit, 200, 1, 20000);
  const offset = toInt(req.query.offset, 0, 0, 100000000);
  const includeBlobs = String(req.query.include_blobs ?? "1") !== "0";

  const orderClause = pickOrderClause(cfg.order);

  try {
    const sql = `
      SELECT * FROM public.${cfg.table}
      ${orderClause}
      LIMIT $1 OFFSET $2
    `;
    const r = await db.query(sql, [limit, offset]);
    let rows = r?.rows || [];
    if (!includeBlobs) rows = removeBlobFields(rows);

    return res.status(200).json({
      ok: true,
      ts: new Date().toISOString(),
      key,
      table: cfg.table,
      rows: rows.length,
      limit,
      offset,
      include_blobs: includeBlobs,
      data: rows,
    });
  } catch (err) {
    console.error(`master/fetch/${key} error:`, err);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch table",
      details: err?.message || String(err),
    });
  }
});

module.exports = router;
