const bcrypt = require("bcrypt");

const Student = require("../models/Student");
const SchoolClass = require("../models/SchoolClass");

// =====================================================
// GET ALL STUDENTS
// =====================================================

const getStudents = async (req, res, next) => {
    try {
        const students = await Student.find()
            .select("-password")
            .populate("class", "name")
            .sort({ rollNumber: 1 });

        return res.json({
            success: true,
            data: students
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET SINGLE STUDENT
// =====================================================

const getStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(
            req.params.id
        )
            .select("-password")
            .populate("class", "name");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.json({
            success: true,
            data: student
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// CREATE STUDENT
// =====================================================

const createStudent = async (req, res, next) => {
    try {
        const {
            fullName,
            rollNumber,
            email,
            class: classId,
            dateOfBirth,
            password
        } = req.body;

        if (
            !fullName?.trim() ||
            !rollNumber?.trim() ||
            !email?.trim() ||
            !classId ||
            !dateOfBirth ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedName =
            fullName.trim();

        const normalizedRollNumber =
            rollNumber.trim();

        const normalizedEmail =
            email.trim().toLowerCase();

        // =====================================================
        // VALIDATE CLASS
        // =====================================================

        const schoolClass =
            await SchoolClass.findById(classId);

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        // =====================================================
        // CHECK DUPLICATE STUDENT
        // =====================================================

        const existingStudent =
            await Student.findOne({
                $or: [
                    {
                        email: normalizedEmail
                    },
                    {
                        rollNumber:
                            normalizedRollNumber
                    }
                ]
            });

        if (existingStudent) {
            if (
                existingStudent.email ===
                normalizedEmail
            ) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A student with this email already exists"
                });
            }

            if (
                existingStudent.rollNumber ===
                normalizedRollNumber
            ) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A student with this roll number already exists"
                });
            }
        }

        // =====================================================
        // HASH PASSWORD
        // =====================================================

        const hashedPassword =
            await bcrypt.hash(password, 12);

        // =====================================================
        // CREATE STUDENT
        // =====================================================

        const student =
            await Student.create({
                fullName: normalizedName,
                rollNumber: normalizedRollNumber,
                email: normalizedEmail,
                class: classId,
                dateOfBirth,
                password: hashedPassword,
                role: "student"
            });

        // =====================================================
        // RESPONSE WITHOUT PASSWORD
        // =====================================================

        const studentResponse =
            await Student.findById(student._id)
                .select("-password")
                .populate("class", "name");

        return res.status(201).json({
            success: true,
            message:
                "Student created successfully",
            data: studentResponse
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// UPDATE STUDENT
// =====================================================

const updateStudent = async (req, res, next) => {
    try {
        const {
            fullName,
            rollNumber,
            email,
            class: classId,
            dateOfBirth
        } = req.body;

        const student =
            await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // =====================================================
        // VALIDATE CLASS
        // =====================================================

        if (classId) {
            const schoolClass =
                await SchoolClass.findById(classId);

            if (!schoolClass) {
                return res.status(404).json({
                    success: false,
                    message: "Class not found"
                });
            }

            student.class = classId;
        }

        // =====================================================
        // NORMALIZE VALUES
        // =====================================================

        const normalizedEmail =
            email?.trim().toLowerCase();

        const normalizedRollNumber =
            rollNumber?.trim();

        // =====================================================
        // CHECK DUPLICATE EMAIL / ROLL NUMBER
        // =====================================================

        if (
            normalizedEmail ||
            normalizedRollNumber
        ) {
            const duplicateConditions = [];

            if (normalizedEmail) {
                duplicateConditions.push({
                    email: normalizedEmail
                });
            }

            if (normalizedRollNumber) {
                duplicateConditions.push({
                    rollNumber:
                        normalizedRollNumber
                });
            }

            const existingStudent =
                await Student.findOne({
                    _id: { $ne: student._id },
                    $or: duplicateConditions
                });

            if (existingStudent) {
                if (
                    normalizedEmail &&
                    existingStudent.email ===
                        normalizedEmail
                ) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "A student with this email already exists"
                    });
                }

                if (
                    normalizedRollNumber &&
                    existingStudent.rollNumber ===
                        normalizedRollNumber
                ) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "A student with this roll number already exists"
                    });
                }
            }
        }

        // =====================================================
        // UPDATE FIELDS
        // =====================================================

        if (fullName?.trim()) {
            student.fullName =
                fullName.trim();
        }

        if (normalizedRollNumber) {
            student.rollNumber =
                normalizedRollNumber;
        }

        if (normalizedEmail) {
            student.email =
                normalizedEmail;
        }

        if (dateOfBirth) {
            student.dateOfBirth =
                dateOfBirth;
        }

        await student.save();

        // =====================================================
        // UPDATED RESPONSE
        // =====================================================

        const updatedStudent =
            await Student.findById(student._id)
                .select("-password")
                .populate("class", "name");

        return res.json({
            success: true,
            message:
                "Student updated successfully",
            data: updatedStudent
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// DELETE STUDENT
// =====================================================

const deleteStudent = async (req, res, next) => {
    try {
        const student =
            await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        await Student.findByIdAndDelete(
            req.params.id
        );

        return res.json({
            success: true,
            message:
                "Student deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET STUDENTS BY CLASS
// =====================================================

const getStudentsByClass = async (
    req,
    res,
    next
) => {
    try {
        const schoolClass =
            await SchoolClass.findById(
                req.params.classId
            );

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const students =
            await Student.find({
                class: req.params.classId
            })
                .select("-password")
                .populate("class", "name")
                .sort({ rollNumber: 1 });

        return res.json({
            success: true,
            data: students
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass
};