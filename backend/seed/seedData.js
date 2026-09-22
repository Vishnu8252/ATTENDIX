const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

const connectDB = require("../config/db");

const Admin = require("../models/Admin");
const SchoolClass = require("../models/SchoolClass");
const Student = require("../models/Student");

dotenv.config();

const classes = [
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",

    "Class 11 - PCM",
    "Class 11 - PCB",
    "Class 11 - Commerce",
    "Class 11 - Arts",

    "Class 12 - PCM",
    "Class 12 - PCB",
    "Class 12 - Commerce",
    "Class 12 - Arts"
];

const seedData = async () => {
    try {
        await connectDB();

        // ==========================================
        // ADMIN
        // ==========================================

        const adminEmail = "admin@attendix.com";

        const hashedAdminPassword = await bcrypt.hash(
            "admin123",
            12
        );

        const existingAdmin = await Admin.findOne({
            email: adminEmail
        });

        if (!existingAdmin) {
            await Admin.create({
                name: "Attendix Admin",
                email: adminEmail,
                password: hashedAdminPassword,
                role: "admin"
            });

            console.log("Admin created successfully");
        } else {
            existingAdmin.password = hashedAdminPassword;
            await existingAdmin.save();

            console.log("Admin password reset successfully");
        }

        // ==========================================
        // CLASSES
        // ==========================================

        const classDocuments = {};

        for (const className of classes) {
            let schoolClass = await SchoolClass.findOne({
                name: className
            });

            if (!schoolClass) {
                schoolClass = await SchoolClass.create({
                    name: className
                });

                console.log(`Created: ${className}`);
            } else {
                console.log(`Already exists: ${className}`);
            }

            classDocuments[className] = schoolClass;
        }

        // ==========================================
        // STUDENTS
        // ==========================================

        const hashedStudentPassword = await bcrypt.hash(
            "student123",
            12
        );

        let studentCount = 0;

        for (let classIndex = 0; classIndex < classes.length; classIndex++) {
            const className = classes[classIndex];
            const schoolClass = classDocuments[className];

            /*
                Generate two students for every class.

                Example:

                Class 1
                Roll: 101
                Roll: 102

                Class 2
                Roll: 201
                Roll: 202
            */

            const classNumber = classIndex + 1;

            const students = [
                {
                    fullName: `Student ${classNumber} A`,
                    rollNumber: `${classNumber}01`,
                    email: `student${classNumber}01@attendix.com`,
                    class: schoolClass._id,
                    dateOfBirth: new Date("2015-05-15"),
                    password: hashedStudentPassword,
                    role: "student"
                },
                {
                    fullName: `Student ${classNumber} B`,
                    rollNumber: `${classNumber}02`,
                    email: `student${classNumber}02@attendix.com`,
                    class: schoolClass._id,
                    dateOfBirth: new Date("2015-08-20"),
                    password: hashedStudentPassword,
                    role: "student"
                }
            ];

            for (const studentData of students) {
                const existingStudent = await Student.findOne({
                    email: studentData.email
                });

                if (!existingStudent) {
                    await Student.create(studentData);

                    studentCount++;

                    console.log(
                        `Created student: ${studentData.fullName} - ${className}`
                    );
                } else {
                    console.log(
                        `Already exists: ${studentData.fullName}`
                    );
                }
            }
        }

        // ==========================================
        // COMPLETE
        // ==========================================

        console.log("--------------------------------");
        console.log("Seed completed successfully");
        console.log(`New students created: ${studentCount}`);
        console.log("Total classes: 18");
        console.log("Admin email: admin@attendix.com");
        console.log("Admin password: admin123");
        console.log("Student password: student123");
        console.log("--------------------------------");

        await mongoose.connection.close();

        process.exit(0);
    } catch (error) {
        console.error("Seed Error:", error.message);

        await mongoose.connection.close();

        process.exit(1);
    }
};

seedData();