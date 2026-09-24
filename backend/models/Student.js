const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        rollNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SchoolClass",
            required: true
        },

        dateOfBirth: {
            type: Date,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        // Student profile photo
        photo: {
            type: String,
            default: ""
        },

        role: {
            type: String,
            default: "student",
            enum: ["student"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);