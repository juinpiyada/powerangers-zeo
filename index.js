const express = require('express');
const cors = require('cors');
const compression = require('compression');
const db = require('./config/db_conn');
const { Pool } = require('pg'); // PostgreSQL pool for connection pooling

// All your route imports (paths should be correct and match filenames)
const loginRouter = require('./routes/user');
const collegeRoutes = require('./routes/master_college_api');
const masterUserApi = require('./routes/master_user');
const collegeGroupRoutes = require('./routes/collegeGroup');
const courseRoutes = require('./routes/master_course_api');
const subjectRoutes = require('./routes/master_subject_api');
const studentRoutes = require('./routes/master_student_api');
const teacherRoutes = require('./routes/master_teacher_api');
const masterDeptsRoutes = require('./routes/master_depts');
const collegeAcadYearRoutes = require('./routes/master_acadyear_api');
const subjectCourseRoutes = require('./routes/subject_course_api');
const mastermenuRoutes = require('./routes/menu_master_api');
const masterSubjectTeacherRoutes = require('./routes/subject_teacher_api');
const userRoleApi = require('./routes/user_role_api');
const MasterRole = require('./routes/master_role_api'); // Assuming you have this route
const DailyRoutine = require('./routes/college_daily_routine_api');
const classroomAPI = require('./routes/classroomapi');
const teacherAvailabilityRoutes = require('./routes/teacher_availbility_api');
const collegedailyroutineRoutes = require('./routes/college_daily_routine_api');
const courseofferingRoutes = require('./routes/course_offering_api');
const courseregistrationRoutes = require('./routes/course_registration_api');
const collegeexamroutineRoutes = require('./routes/college_exam_routine_api');
const subjectelecRoutes = require('./routes/subjectelec');
const examroutineRoutes = require('./routes/college_exam_routine_api');
const CollegeAttendenceManager = require('./routes/college_attendance_api');
const EmployeeAttendanceManager = require('./routes/employee_attendance_api');
const ExamResult = require('./routes/college_exam_result_api');
const chartDataApi = require('./routes/chart_data');
const calendarattendance = require('./routes/calendar-attendance');
const cmsFeeStructure = require('./routes/cmsFeeStructure');
const cmsPayment = require('./routes/cmsPayment');
const cmsStudentFeeInvoice = require('./routes/cmsStudentFeeInvoice');
const cmsStuScholarship = require('./routes/cmsStuScholarship');

const app = express();

const PORT = process.env.PORT || 9090;

// CORS Configuration - Allowing only powerangers-zeo.vercel.app origin
app.use(cors({
  origin: 'https://powerangers-zeo.vercel.app',  // Allows only https://powerangers-zeo.vercel.app
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you want to support cookies or authorization headers
}));

// Use compression to reduce the size of response bodies (for faster response times)
app.use(compression());

// Use body-parser with a limit for large payloads
app.use(express.json({ limit: '10mb' }));

// Database connection pooling to improve performance
const pool = new Pool({
  user: 'avnadmin',
  host: 'pg-f24ca1b-juinpiyada1-db52.e.aivencloud.com',
  database: 'sms_db',
  password: 'AVNS_02ltDOcBtt0byI5MRf0',
  port: '10005', // Default PostgreSQL port
});

// Attaching the pool to each request to use for queries
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// ROUTES
app.use('/login', loginRouter);
app.use('/master-college', collegeRoutes);
app.use('/api', masterUserApi);
app.use('/api/college-group', collegeGroupRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/subject', subjectRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/master-depts', masterDeptsRoutes);
app.use('/api/master-acadyear', collegeAcadYearRoutes);
app.use('/api/subject-course', subjectCourseRoutes);
app.use('/api/menu-master', mastermenuRoutes);
app.use('/api/subject-teacher', masterSubjectTeacherRoutes);
app.use('/api/user-role', userRoleApi);
app.use('/api/master-role', MasterRole);
app.use('/api/daily-routine', DailyRoutine);
app.use('/api/class-room', classroomAPI);
app.use('/api/teacher-availability-manager', teacherAvailabilityRoutes);
app.use('/api/college-daily-routine', collegedailyroutineRoutes);
app.use('/api/course-offering', courseofferingRoutes);
app.use('/api/course-registration', courseregistrationRoutes);
app.use('/api/college-exam-routine', collegeexamroutineRoutes);
app.use('/api/subject-elective', subjectelecRoutes);
app.use('/api/exam-routine-manager', examroutineRoutes);
app.use('/api/course-registration', courseregistrationRoutes);
app.use('/api/CollegeAttendenceManager', CollegeAttendenceManager);
app.use('/api/employee-attendance', EmployeeAttendanceManager);
app.use('/api/exam-result', ExamResult);
app.use('/api/chart-data', chartDataApi);
app.use('/api/calendar-attendance', calendarattendance);
app.use('/api/cms-fee-structure', cmsFeeStructure);
app.use('/api/cms-payments', cmsPayment);
app.use('/api/cms-student-fee-invoice', cmsStudentFeeInvoice);
app.use('/api/cms-stu-scholarship', cmsStuScholarship);

// Health-check for the server
app.get('/', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle timeouts for slow requests
app.use((req, res, next) => {
  res.setTimeout(5000, () => {  // Timeout after 5 seconds
    res.status(408).send('Request Timeout');
  });
  next();
});

// Database check and server start
db.query('SELECT NOW()')
  .then(({ rows }) => {
    console.log('✅ Connected to Postgres at', rows[0].now);
    app.listen(PORT, () => {
      console.log(`🚀 Server running at https://powerangers-zeo.vercel.app`);
    });
  })
  .catch((err) => {
    console.error('❌ Could not connect to Postgres:', err);
    process.exit(1);
  });
