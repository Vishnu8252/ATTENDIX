const express = require("express");

const {
    markAttendance,
    getAttendance,
    getStudentAttendance,
    updateAttendance,
    exportAttendance,
    exportAttendanceCSV
} = require("../controllers/attendanceController");

const {
    isAuthenticated
} = require("../middleware/authMiddleware");

const authorizeRole = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// AUTHENTICATION
// =====================================================

router.use(isAuthenticated);

// =====================================================
// ADMIN - MARK ATTENDANCE
// =====================================================

router.post(
    "/",
    authorizeRole("admin"),
    markAttendance
);

// =====================================================
// ADMIN - GET ATTENDANCE
// =====================================================

router.get(
    "/",
    authorizeRole("admin"),
    getAttendance
);

// =====================================================
// ADMIN - EXPORT EXCEL
// =====================================================

router.get(
    "/export",
    authorizeRole("admin"),
    exportAttendance
);

// =====================================================
// ADMIN - EXPORT CSV
// =====================================================

router.get(
    "/export/csv",
    authorizeRole("admin"),
    exportAttendanceCSV
);

// =====================================================
// STUDENT - OWN ATTENDANCE
// =====================================================

router.get(
    "/student/:studentId",
    getStudentAttendance
);

// =====================================================
// ADMIN - UPDATE ATTENDANCE
// =====================================================

router.put(
    "/:id",
    authorizeRole("admin"),
    updateAttendance
);

module.exports = router;