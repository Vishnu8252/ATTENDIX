const Student = require("../models/Student");
const SchoolClass = require("../models/SchoolClass");
const Attendance = require("../models/Attendance");

// =====================================================
// GET ADMIN DASHBOARD
// =====================================================

const getDashboard = async (req, res, next) => {
    try {
        const totalStudents =
            await Student.countDocuments();

        const totalClasses =
            await SchoolClass.countDocuments();

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const presentToday =
            await Attendance.countDocuments({
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: "present"
            });

        const absentToday =
            await Attendance.countDocuments({
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: "absent"
            });

        const totalAttendance =
            presentToday + absentToday;

        const overallAttendance =
            totalAttendance > 0
                ? (
                    (presentToday / totalAttendance) *
                    100
                ).toFixed(2)
                : 0;

        return res.json({
            success: true,
            data: {
                totalStudents,
                totalClasses,
                presentToday,
                absentToday,
                overallAttendance
            }
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET ALL CLASSES
// =====================================================

const getClasses = async (req, res, next) => {
    try {
        const classes =
            await SchoolClass.find()
                .sort({ name: 1 });

        const classesWithCount =
            await Promise.all(
                classes.map(async (schoolClass) => {
                    const studentCount =
                        await Student.countDocuments({
                            class: schoolClass._id
                        });

                    return {
                        ...schoolClass.toObject(),
                        studentCount
                    };
                })
            );

        return res.json({
            success: true,
            data: classesWithCount
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET SINGLE CLASS
// =====================================================

const getClass = async (req, res, next) => {
    try {
        const schoolClass =
            await SchoolClass.findById(
                req.params.id
            );

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const students =
            await Student.find({
                class: schoolClass._id
            })
                .select("-password")
                .sort({ rollNumber: 1 });

        return res.json({
            success: true,
            data: {
                class: schoolClass,
                students
            }
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// CREATE CLASS
// =====================================================

const createClass = async (req, res, next) => {
    try {
        const name = req.body.name?.trim();

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Class name is required"
            });
        }

        const schoolClass =
            await SchoolClass.create({
                name
            });

        return res.status(201).json({
            success: true,
            message: "Class created successfully",
            data: schoolClass
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// UPDATE CLASS
// =====================================================

const updateClass = async (req, res, next) => {
    try {
        const name = req.body.name?.trim();

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Class name is required"
            });
        }

        const schoolClass =
            await SchoolClass.findByIdAndUpdate(
                req.params.id,
                { name },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        return res.json({
            success: true,
            message: "Class updated successfully",
            data: schoolClass
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// DELETE CLASS
// =====================================================

const deleteClass = async (req, res, next) => {
    try {
        const studentCount =
            await Student.countDocuments({
                class: req.params.id
            });

        if (studentCount > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete class because students are assigned to it"
            });
        }

        const schoolClass =
            await SchoolClass.findByIdAndDelete(
                req.params.id
            );

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        return res.json({
            success: true,
            message: "Class deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getDashboard,
    getClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass
};