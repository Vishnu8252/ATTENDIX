const express = require("express");

const {
    login,
    logout,
    getCurrentUser,
    changePassword
} = require("../controllers/authController");

const {
    isAuthenticated
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    login
);

// =====================================================
// LOGOUT
// =====================================================

router.get(
    "/logout",
    logout
);

// =====================================================
// CURRENT USER
// =====================================================

router.get(
    "/me",
    getCurrentUser
);

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put(
    "/change-password",
    isAuthenticated,
    changePassword
);

module.exports = router;