const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

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


connectDB();

const app = express();
app.set("trust proxy", 1);
// CORS
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
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
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax"
        }
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/students", studentRoutes);
app.use("/attendance", attendanceRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ATTENDIX API is running 🚀"
    });
});

// Error handler
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});