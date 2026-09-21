const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            required: true,
            enum: ["present", "absent"]
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate attendance
// for the same student on the same date
attendanceSchema.index(
    {
        student: 1,
        date: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "Attendance",
    attendanceSchema
);