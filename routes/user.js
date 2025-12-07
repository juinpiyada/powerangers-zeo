// routes/login.js
const express = require('express');
const router = express.Router();
const db = require('../config/db_conn');

/* -------------------------------------------------------------------------- */
/*                    Helper: SPA-safe + optional HTTP redirect               */
/* -------------------------------------------------------------------------- */
function maybeRedirect(req, res, redirectUrl, body) {
  // Always include redirect_url in JSON so SPA (axios/fetch) can navigate client-side.
  // Also set a hint header.
  if (redirectUrl) {
    res.setHeader('X-Redirect-To', redirectUrl);
  }

  // If caller wants a hard redirect (e.g., browser form post) use:
  // - Header: X-Force-Redirect: 1
  // - or query ?redirect=1
  // - or Accept: text/html (typical browser nav)
  const accept = req.headers.accept || '';
  const wantsHardRedirect =
    req.headers['x-force-redirect'] === '1' ||
    req.query.redirect === '1' ||
    /text\/html/.test(accept);

  if (redirectUrl && wantsHardRedirect) {
    // 303: redirect after POST (safe method switch)
    return res.redirect(303, redirectUrl);
  }

  // Default: JSON response (SPA-friendly)
  return res.json({
    ...body,
    redirect_url: redirectUrl || null
  });
}

/* ----------------------------- Healthcheck -------------------------------- */
router.get('/test', (req, res) => {
  console.log('🧪 Login route test endpoint called!');
  res.json({
    message: 'Login route is working',
    timestamp: new Date().toISOString(),
    route: '/login/test'
  });
});

/* --------------------------------- POST /login ---------------------------- */
router.post('/', async (req, res) => {
  console.log('🚪 LOGIN ROUTE CALLED - POST /login/', {
    body: req.body ? Object.keys(req.body) : 'no body',
    username: req.body?.username,
    password_provided: !!req.body?.password
  });

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const sql = `
      SELECT
        mu.userpwd,
        mu.userroles,
        mu.useractive,

        -- student branch
        sm.stuuserid,
        sm.stu_curr_semester,
        sm.stu_section,
        cstu.collegeid        AS student_college_id,
        cstu.collegename      AS student_college_name,
        cstu.collegecode      AS student_college_code,
        cstu.collegegroupid   AS student_college_group_id,

        -- teacher branch
        mt.teacheruserid,
        mt.teacherid,
        mt.teacher_dept_id    AS teacher_dept_id,
        to_jsonb(mt)          AS teacher_profile,
        cteach.collegeid      AS teacher_college_id,
        cteach.collegename    AS teacher_college_name,
        cteach.collegecode    AS teacher_college_code,
        cteach.collegegroupid AS teacher_college_group_id,

        -- college account branch
        cown.collegeid        AS owner_college_id,
        cown.collegename      AS owner_college_name,
        cown.collegecode      AS owner_college_code,
        cown.collegegroupid   AS owner_college_group_id,

        -- group owner branch
        cg.groupid            AS group_id,
        cg.groupdesc          AS group_desc,
        cg.grouprole          AS group_role,

        -- Active college (student -> teacher -> owner)
        COALESCE(cstu.collegeid,   cteach.collegeid,   cown.collegeid)   AS active_college_id,
        COALESCE(cstu.collegename, cteach.collegename, cown.collegename) AS active_college_name,
        COALESCE(cstu.collegecode, cteach.collegecode, cown.collegecode) AS active_college_code,
        COALESCE(cstu.collegegroupid, cteach.collegegroupid, cown.collegegroupid) AS active_college_group_id,

        -- Active group (group owner first, else via active college’s group)
        COALESCE(cg.groupid, COALESCE(cstu.collegegroupid, cteach.collegegroupid, cown.collegegroupid)) AS active_group_id

      FROM public.master_user mu
      LEFT JOIN public.student_master sm
        ON sm.stuuserid = mu.userid
      LEFT JOIN public.master_teacher mt
        ON mt.teacheruserid = mu.userid
      LEFT JOIN public.master_college cstu
        ON cstu.collegeid = sm.stu_inst_id
      LEFT JOIN public.master_college cteach
        ON cteach.collegeid = mt.teachercollegeid
      LEFT JOIN public.master_college cown
        ON cown.collegeuserid = mu.userid
      LEFT JOIN public.master_college_group cg
        ON cg.group_user_id = mu.userid
      WHERE mu.userid = $1
      LIMIT 1;
    `;

    const result = await db.query(sql, [username]);

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const row = result.rows[0];

    if (!row.useractive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // (Plain-text) password match per current schema
    if (password !== row.userpwd) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Stamp last logon
    try {
      await db.query(
        'UPDATE public.master_user SET userlastlogon = now(), updatedat = now() WHERE userid = $1',
        [username]
      );
      console.log('🕒 userlastlogon updated for', username);
    } catch (e) {
      console.warn('⚠️ Failed to update userlastlogon for', username, e.message);
    }

    // Roles → normalize (case-insensitive, spaces/dashes -> underscore)
    const canon = (s) => String(s || '')
      .trim()
      .replace(/[\s\-]+/g, '_')     // spaces/dashes -> _
      .replace(/[^\w]/g, '_')       // any other punct -> _
      .toUpperCase();

    const roles = String(row.userroles || '')
      .split(/[,\s]+/)
      .map(canon)
      .filter(Boolean);

    // Extras for client session
    const extras = {
      // Student
      stuuserid: row.stuuserid ?? null,
      student_semester: row.stu_curr_semester ?? null,
      student_section: row.stu_section ?? null,

      // Teacher
      teacher_userid: row.teacheruserid ?? null,
      teacher_id: row.teacherid ?? null,
      teacher_dept_id: row.teacher_dept_id ?? null,
      teacher_profile: row.teacher_profile ?? null,

      // Colleges
      student_college_id: row.student_college_id ?? null,
      student_college_name: row.student_college_name ?? null,
      student_college_code: row.student_college_code ?? null,
      student_college_group_id: row.student_college_group_id ?? null,

      teacher_college_id: row.teacher_college_id ?? null,
      teacher_college_name: row.teacher_college_name ?? null,
      teacher_college_code: row.teacher_college_code ?? null,
      teacher_college_group_id: row.teacher_college_group_id ?? null,

      owner_college_id: row.owner_college_id ?? null,
      owner_college_name: row.owner_college_name ?? null,
      owner_college_code: row.owner_college_code ?? null,
      owner_college_group_id: row.owner_college_group_id ?? null,

      // Group owner
      group_id: row.group_id ?? null,
      group_desc: row.group_desc ?? null,
      group_role: row.group_role ?? null,

      // Active picks
      college_id: row.active_college_id ?? null,
      college_name: row.active_college_name ?? null,
      collegecode: row.active_college_code ?? null,
      college_group_id: row.active_college_group_id ?? null,
      active_group_id: row.active_group_id ?? null
    };

    // Core responder (no audit log)
    const send = async ({ payload, redirectUrl = null }) => {
      const body = {
        ...payload,
        userid: username,
        roles,
        ...extras
      };
      return maybeRedirect(req, res, redirectUrl, body);
    };

    const hasAny = (arr, list) => arr.some(r => list.includes(r));

    // === Role mapping + finance redirects (canonical tokens) ===
    if (hasAny(roles, ['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'SMS_SUPERADM'])) {
      return await send({
        payload: {
          message: 'Admin login successful',
          user_role: 'admin',
          role_description: 'Admin / Super Admin User'
        }
      });
    } else if (roles.includes('STU_ONBOARD')) {
      return await send({
        payload: {
          message: 'Onboard Student login successful',
          user_role: 'student',
          role_description: 'Onboard Student User'
        }
      });
    } else if (roles.includes('STU_CURR') || roles.includes('STU-CURR')) {
      // NOTE: roles are canonicalized to underscore, but kept your extra check as requested
      return await send({
        payload: {
          message: 'Current Student login successful',
          user_role: 'student',
          role_description: 'Current Student User'
        }
      });
    } else if (roles.includes('STU_PASSED')) {
      return await send({
        payload: {
          message: 'Passed Student login successful',
          user_role: 'student',
          role_description: 'Passed Student User'
        }
      });
    } else if (roles.includes('TEACHER')) {
      return await send({
        payload: {
          message: 'Teacher login successful',
          user_role: 'teacher',
          role_description: 'Teacher User'
        }
      });
    } else if (roles.includes('STU_COUNCIL')) {
      return await send({
        payload: {
          message: 'Student Council login successful',
          user_role: 'student_council',
          role_description: 'Student Council User'
        }
      });
    } else if (roles.includes('GRP_ADM')) {
      return await send({
        payload: {
          message: 'Group Admin login successful',
          user_role: 'group_admin',
          role_description: 'Group Admin User'
        }
      });
    } else if (roles.includes('GRP_MGMT_USR')) {
      return await send({
        payload: {
          message: 'Group Manager User login successful',
          user_role: 'group_manager',
          role_description: 'Group Management User'
        }
      });
    } else if (roles.includes('GRP_ACT')) {
      return await send({
        payload: {
          message: 'Group Active User login successful',
          user_role: 'group_active',
          role_description: 'Group Active User'
        }
      });
    } else if (roles.includes('USR_TCHR')) {
      return await send({
        payload: {
          message: 'User Teacher login successful',
          user_role: 'user_teacher',
          role_description: 'User Teacher Role'
        }
      });
    } else if (roles.includes('USER')) {
      return await send({
        payload: {
          message: 'User login successful',
          user_role: 'user',
          role_description: 'Normal User'
        }
      });
    } else if (roles.includes('FIN_ACT_ADM')) {
      // 🔸 Finance Admin → redirect to /finDashbord
      return await send({
        payload: {
          message: 'Finance Admin login successful',
          user_role: 'finance_admin',
          role_description: 'Finance Admin User'
        },
        redirectUrl: '/finDashbord'
      });
    } else if (roles.includes('FIN_ACT')) {
      // 🔸 Finance User → redirect to /finDashbord
      return await send({
        payload: {
          message: 'Finance login successful',
          user_role: 'finance',
          role_description: 'Finance User'
        },
        redirectUrl: '/finDashbord'
      });
    } else if (roles.includes('HR_LEAVE')) {
      return await send({
        payload: {
          message: 'HR (Leave) login successful',
          user_role: 'hr_leave',
          role_description: 'HR Leave User'
        }
      });
    } else if (roles.includes('ROLE_HR') || roles.includes('HR')) {
      return await send({
        payload: {
          message: 'HR login successful',
          user_role: 'hr',
          role_description: 'HR User'
        }
      });
    } else if (roles.includes('GRP_AD_OFFICER')) {
      return await send({
        payload: {
          message: 'Group Officer login successful',
          user_role: 'group_officer',
          role_description: 'Group Admin Officer'
        }
      });
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
  } catch (err) {
    console.error('Error during login process:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
