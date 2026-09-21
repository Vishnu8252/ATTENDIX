const express = require("express");

const {
    getDashboard,
    getClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass
} = require("../controllers/adminController");

const {
    exportAttendance
} = require("../controllers/attendanceController");

const { isAuthenticated } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// ADMIN AUTHORIZATION
// =====================================================

router.use(
    isAuthenticated,
    authorizeRole("admin")
);

// =====================================================
// DASHBOARD
// =====================================================

router.get(
    "/dashboard",
    getDashboard
);

// =====================================================
// CLASSES
// =====================================================

router.get(
    "/classes",
    getClasses
);

router.get(
    "/classes/:id",
    getClass
);

router.post(
    "/classes",
    createClass
);

router.put(
    "/classes/:id",
    updateClass
);

router.delete(
    "/classes/:id",
    deleteClass
);

// =====================================================
// ATTENDANCE EXPORT
// =====================================================

router.get(
    "/export",
    exportAttendance
);

module.exports = router;