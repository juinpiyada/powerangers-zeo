require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db_conn");

const app = express();

// ───────────────────────────────────────────
// 🌍 MIDDLEWARES
// ───────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ───────────────────────────────────────────
// 🚀 ROUTE IMPORTS
// ───────────────────────────────────────────
const loginRouter = require("./routes/user");
const collegeRoutes = require("./routes/master_college_api");
const masterUserApi = require("./routes/master_user");
const collegeGroupRoutes = require("./routes/collegeGroup");
const courseRoutes = require("./routes/master_course_api");
const subjectRoutes = require("./routes/master_subject_api");
const studentRoutes = require("./routes/master_student_api");
const teacherRoutes = require("./routes/master_teacher_api");
const masterDeptsRoutes = require("./routes/master_depts");
const collegeAcadYearRoutes = require("./routes/master_acadyear_api");
const subjectCourseRoutes = require("./routes/subject_course_api");
const mastermenuRoutes = require("./routes/menu_master_api");
const masterSubjectTeacherRoutes = require("./routes/subject_teacher_api");
const userRoleApi = require("./routes/user_role_api");
const MasterRole = require("./routes/master_role_api");
const DailyRoutine = require("./routes/college_daily_routine_api");
const classroomAPI = require("./routes/classroomapi");
const teacherAvailabilityRoutes = require("./routes/teacher_availbility_api");
const courseofferingRoutes = require("./routes/course_offering_api");
const courseregistrationRoutes = require("./routes/course_registration_api");
const collegeexamroutineRoutes = require("./routes/college_exam_routine_api");
const subjectelecRoutes = require("./routes/subjectelec");
const CollegeAttendenceManager = require("./routes/college_attendance_api");
const EmployeeAttendanceManager = require("./routes/employee_attendance_api");
const ExamResult = require("./routes/college_exam_result_api");
const chartDataApi = require("./routes/chart_data");
const calendarattendance = require("./routes/calendar-attendance");
const smsDeviceRoutes = require("./routes/smsDeviceRoutes");
const whiteboardCmsApi = require("./routes/whiteboard_cms_api");
const teacherDtlsApi = require("./routes/teacher_dtls_api");
const userDtlsRouter = require("./routes/user_dtls");
const studentMasterRoutes = require("./routes/student_master");
const teacherMasterRoutes = require("./routes/teacher_master_bulk_up");
const auditLogRoutes = require("./routes/audit_log_api");
const cmsFeeStructure = require("./routes/cmsFeeStructure");
const cmsPayment = require("./routes/cmsPayment");
const cmsStudentFeeInvoice = require("./routes/cmsStudentFeeInvoice");
const cmsStuScholarship = require("./routes/cmsStuScholarship");
const demandLettersRouter = require("./routes/demandLetters");
const examResultApi = require("./routes/exam_result_api");
const teacherInfoApi = require("./routes/teacher_inform_api");
const studentInformationRouter = require("./routes/student_information");
const leaveApplicationRouter = require("./routes/leave_application");
const studentAyRoutes = require("./routes/student_ay");
const finMasterStudent = require("./routes/fin_master_studnet");

// ───────────────────────────────────────────
// 🚏 MOUNT ROUTES
// ───────────────────────────────────────────
app.use("/login", loginRouter);
app.use("/master-college", collegeRoutes);
app.use("/api", masterUserApi);
app.use("/api/college-group", collegeGroupRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/master-depts", masterDeptsRoutes);
app.use("/api/master-acadyear", collegeAcadYearRoutes);
app.use("/api/subject-course", subjectCourseRoutes);
app.use("/api/menu-master", mastermenuRoutes);
app.use("/api/subject-teacher", masterSubjectTeacherRoutes);
app.use("/api/user-role", userRoleApi);
app.use("/api/master-role", MasterRole);
app.use("/api/daily-routine", DailyRoutine);
app.use("/api/class-room", classroomAPI);
app.use("/api/teacher-availability-manager", teacherAvailabilityRoutes);
app.use("/api/course-offering", courseofferingRoutes);
app.use("/api/course-registration", courseregistrationRoutes);
app.use("/api/college-exam-routine", collegeexamroutineRoutes);
app.use("/api/subject-elective", subjectelecRoutes);
app.use("/api/CollegeAttendenceManager", CollegeAttendenceManager);
app.use("/api/employee-attendance", EmployeeAttendanceManager);
app.use("/api/exam-result", ExamResult);
app.use("/api/chart-data", chartDataApi);
app.use("/api/calendar-attendance", calendarattendance);
app.use("/api/sms-device", smsDeviceRoutes);
app.use("/api/whiteboard-cms", whiteboardCmsApi);
app.use("/api/teacher-dtls", teacherDtlsApi);
app.use("/api/user-dtls", userDtlsRouter);
app.use("/api/students-up", studentMasterRoutes);
app.use("/api/teacher-master-bulk-up", teacherMasterRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/cms-fee-structure", cmsFeeStructure);
app.use("/api/cms-payments", cmsPayment);
app.use("/api/cms-student-fee-invoice", cmsStudentFeeInvoice);
app.use("/api/cms-stu-scholarship", cmsStuScholarship);
app.use("/api/demand-letters", demandLettersRouter);
app.use("/api/exam-result", examResultApi);
app.use("/api/teacher-info", teacherInfoApi);
app.use("/api/student-information", studentInformationRouter);
app.use("/api/leave-application", leaveApplicationRouter);
app.use("/api/student-ay", studentAyRoutes);
app.use("/api/fin-master-student", finMasterStudent);

// ───────────────────────────────────────────
// ❤️ HEALTH CHECK + DB TEST
// ───────────────────────────────────────────
app.get("/", async (_, res) => {
  try {
    const { rows } = await db.query("SELECT NOW()");
    res.json({
      status: "Serverless vibing ✨",
      db_time: rows[0].now,
      message: "Old code. New era. No fear."
    });
  } catch (err) {
    res.status(500).json({
      status: "DB connection failed",
      error: err.message
    });
  }
});

// ───────────────────────────────────────────
// ⚡ Serverless Export
// ───────────────────────────────────────────
const serverless = require("serverless-http");
module.exports = serverless(app);
