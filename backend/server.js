require("dotenv").config();
const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const cors = require("cors");
const passport = require("./config/passport");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();
const dns=require("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);
// Connect MongoDB
connectDB();

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
);

// =====================================================
// SESSION
// =====================================================

app.use(
    session({
        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI
        }),

        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: false
        }
    })
);

// =====================================================
// PASSPORT
// =====================================================

app.use(passport.initialize());
app.use(passport.session());

// =====================================================
// ROUTES
// =====================================================

// Authentication
app.use("/", authRoutes);

// Admin
app.use("/admin", adminRoutes);

// Students
app.use("/students", studentRoutes);

// Attendance
app.use("/attendance", attendanceRoutes);

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ATTENDIX API is running 🚀"
    });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorHandler);

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});