const express = require('express');
const cors = require('cors');
const db = require('./config/db_conn');

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
const subjectelecRoutes = require('./routes/subjectelec'); // Assuming you have this route
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

// CORS Configuration - Allowing https://powerangers-zeo.vercel.app and all origins
app.use(cors({
  origin: (origin, callback) => {
    if (origin === 'https://powerangers-zeo.vercel.app' || !origin) {
      callback(null, true); // Allow the specified origin or allow no origin (i.e., any origin)
    } else {
      callback(new Error('Not allowed by CORS'), false); // Reject other origins
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you want to support cookies or authorization headers
}));

// Parse JSON bodies
app.use(express.json());

// ROUTES
app.use('/login', loginRouter);
app.use('/master-college', collegeRoutes);
app.use('/api', masterUserApi);
app.use('/api/college-group', collegeGroupRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/subject', subjectRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/master-depts', masterDeptsRoutes); // Use /api for consistency
app.use('/api/master-acadyear', collegeAcadYearRoutes);
app.use('/api/subject-course', subjectCourseRoutes);
app.use('/api/menu-master', mastermenuRoutes);
app.use('/api/subject-teacher', masterSubjectTeacherRoutes);
app.use('/api/user-role', userRoleApi);
app.use('/api/master-role', MasterRole); // Assuming you have this route
app.use('/api/daily-routine', DailyRoutine);
app.use('/api/class-room', classroomAPI);
app.use('/api/teacher-availability-manager', teacherAvailabilityRoutes);
app.use('/api/college-daily-routine', collegedailyroutineRoutes);
app.use('/api/course-offering', courseofferingRoutes); // Assuming you have this route
app.use('/api/course-registration', courseregistrationRoutes); // Assuming you have this route
app.use('/api/college-exam-routine', collegeexamroutineRoutes); // Assuming you have this route
app.use('/api/subject-elective', subjectelecRoutes); // Assuming you have this route
app.use('/api/exam-routine-manager', examroutineRoutes); // Assuming you have this route
app.use('/api/course-registration', courseregistrationRoutes); // Assuming you have this route
app.use('/api/CollegeAttendenceManager', CollegeAttendenceManager); // Assuming you have this route
app.use('/api/employee-attendance', EmployeeAttendanceManager); // Assuming you have this route
app.use('/api/exam-result', ExamResult); // Assuming you have this route
app.use('/api/chart-data', chartDataApi);
app.use('/api/calendar-attendance', calendarattendance);
app.use('/api/cms-fee-structure', cmsFeeStructure);
app.use('/api/cms-payments', cmsPayment);
app.use('/api/cms-student-fee-invoice', cmsStudentFeeInvoice);
app.use('/api/cms-stu-scholarship', cmsStuScholarship); // Assuming you have this route

// Health-check
app.get('/', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
