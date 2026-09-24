const express = require("express");

const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    uploadStudentPhoto,
    getMyProfile
} = require("../controllers/studentController");

const {
    isAuthenticated
} = require("../middleware/authMiddleware");

const authorizeRole = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get(
    "/profile",
    isAuthenticated,
    authorizeRole("student"),
    getMyProfile
);
// =====================================================
// STUDENT SELF PHOTO UPLOAD
// =====================================================

router.post(
    "/profile/photo",
    isAuthenticated,
    authorizeRole("student"),
    upload.single("photo"),
    uploadStudentPhoto
);


// =====================================================
// ADMIN ONLY ROUTES
// =====================================================

router.use(
    isAuthenticated,
    authorizeRole("admin")
);

router.get(
    "/",
    getStudents
);

router.get(
    "/class/:classId",
    getStudentsByClass
);

router.get(
    "/:id",
    getStudent
);

router.post(
    "/",
    upload.single("photo"),
    createStudent
);

router.put(
    "/:id",
    updateStudent
);

router.delete(
    "/:id",
    deleteStudent
);


module.exports = router;