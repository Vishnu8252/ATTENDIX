const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const Admin = require("../models/Admin");
const Student = require("../models/Student");

// =====================================================
// LOCAL STRATEGY
// =====================================================

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },

        async (email, password, done) => {
            try {
                const normalizedEmail = email
                    .trim()
                    .toLowerCase();

                // =====================================================
                // CHECK ADMIN
                // =====================================================

                let user = await Admin.findOne({
                    email: normalizedEmail
                });

                let role = "admin";

                // =====================================================
                // CHECK STUDENT
                // =====================================================

                if (!user) {
                    user = await Student.findOne({
                        email: normalizedEmail
                    });

                    role = "student";
                }

                // =====================================================
                // USER NOT FOUND
                // =====================================================

                if (!user) {
                    return done(null, false, {
                        message: "Invalid email or password"
                    });
                }

                // =====================================================
                // PASSWORD CHECK
                // =====================================================

                const isMatch = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!isMatch) {
                    return done(null, false, {
                        message: "Invalid email or password"
                    });
                }

                // =====================================================
                // LOGIN SUCCESSFUL
                // =====================================================

                return done(null, {
                    id: user._id,
                    role,
                    name: user.name || user.fullName,
                    email: user.email
                });

            } catch (error) {
                console.error(
                    "Passport Login Error:",
                    error.message
                );

                return done(error);
            }
        }
    )
);

// =====================================================
// SERIALIZE USER
// =====================================================

passport.serializeUser((user, done) => {
    done(null, {
        id: user.id,
        role: user.role
    });
});

// =====================================================
// DESERIALIZE USER
// =====================================================

passport.deserializeUser(async (data, done) => {
    try {
        let user;

        // =====================================================
        // ADMIN
        // =====================================================

        if (data.role === "admin") {
            user = await Admin.findById(data.id)
                .select("-password");
        }

        // =====================================================
        // STUDENT
        // =====================================================

        else if (data.role === "student") {
            user = await Student.findById(data.id)
                .select("-password")
                .populate("class");
        }

        // Invalid role
        else {
            return done(null, false);
        }

        // User no longer exists
        if (!user) {
            return done(null, false);
        }

        // =====================================================
        // USER OBJECT
        // =====================================================

        done(null, {
            id: user._id,
            role: data.role,
            name: user.name || user.fullName,
            email: user.email,
            class: user.class || null
        });

    } catch (error) {
        console.error(
            "Deserialize Error:",
            error.message
        );

        done(error);
    }
});

module.exports = passport;