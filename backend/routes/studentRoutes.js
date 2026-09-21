const express = require("express");

const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass
} = require("../controllers/studentController");

const {
    isAuthenticated
} = require("../middleware/authMiddleware");

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
// STUDENTS
// =====================================================

// Get all students
router.get(
    "/",
    getStudents
);

// Get students by class
router.get(
    "/class/:classId",
    getStudentsByClass
);

// Get single student
router.get(
    "/:id",
    getStudent
);

// Create student
router.post(
    "/",
    createStudent
);

// Update student
router.put(
    "/:id",
    updateStudent
);

// Delete student
router.delete(
    "/:id",
    deleteStudent
);

module.exports = router;