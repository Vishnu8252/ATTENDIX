const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

const connectDB = require("../config/db");
const Admin = require("../models/Admin");
const SchoolClass = require("../models/SchoolClass");

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

        // Create Admin
        const adminEmail = "admin@attendix.com";

        const existingAdmin = await Admin.findOne({
            email: adminEmail
        });

        const hashedPassword = await bcrypt.hash("admin123", 12);

        if (!existingAdmin) {
            await Admin.create({
                name: "Attendix Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin"
            });
        
            console.log("Admin created successfully");
        } else {
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
        
            console.log("Admin password reset successfully");
        }

        // Create Classes
        for (const className of classes) {
            const existingClass = await SchoolClass.findOne({
                name: className
            });

            if (!existingClass) {
                await SchoolClass.create({
                    name: className
                });

                console.log(`Created: ${className}`);
            }
        }

        console.log("Seed completed successfully");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Seed Error:", error.message);

        await mongoose.connection.close();
        process.exit(1);
    }
};

seedData();