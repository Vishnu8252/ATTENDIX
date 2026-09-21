const passport = require("../config/passport");
const bcrypt = require("bcrypt");

const Admin = require("../models/Admin");
const Student = require("../models/Student");

// =====================================================
// LOGIN
// =====================================================

const login = (req, res, next) => {
    passport.authenticate(
        "local",
        (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message:
                        info?.message ||
                        "Invalid credentials"
                });
            }

            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }

                return res.json({
                    success: true,
                    message: "Login successful",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            });
        }
    )(req, res, next);
};

// =====================================================
// LOGOUT
// =====================================================

const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.session.destroy((sessionError) => {
            if (sessionError) {
                return next(sessionError);
            }

            res.clearCookie("connect.sid");

            return res.json({
                success: true,
                message: "Logout successful"
            });
        });
    });
};

// =====================================================
// CURRENT USER
// =====================================================

const getCurrentUser = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        });
    }

    return res.json({
        success: true,
        user: req.user
    });
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res, next) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Current and new password are required"
            });
        }

        const trimmedNewPassword =
            newPassword.trim();

        if (trimmedNewPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters"
            });
        }

        if (
            currentPassword === trimmedNewPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from current password"
            });
        }

        const Model =
            req.user.role === "admin"
                ? Admin
                : Student;

        const user = await Model.findById(
            req.user.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password is incorrect"
            });
        }

        user.password = await bcrypt.hash(
            trimmedNewPassword,
            12
        );

        await user.save();

        return res.json({
            success: true,
            message:
                "Password changed successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    logout,
    getCurrentUser,
    changePassword
};