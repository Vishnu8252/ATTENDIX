const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const XLSX = require("xlsx");
const mongoose = require("mongoose");
// =====================================================
// DATE HELPERS
// =====================================================

const getStartOfDay = (value) => {
    const date = value
        ? new Date(value)
        : new Date();

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    date.setHours(0, 0, 0, 0);

    return date;
};

const getNextDay = (date) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    return nextDate;
};

// =====================================================
// MARK ATTENDANCE
// =====================================================
const markAttendance = async (req, res, next) => {
    try {
        const { classId, date, attendance } = req.body;

        if (!classId) {
            return res.status(400).json({
                success: false,
                message: "Class ID is required"
            });
        }

        if (
            !attendance ||
            !Array.isArray(attendance) ||
            attendance.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Attendance data is required"
            });
        }

        const attendanceDate = getStartOfDay(date);

        if (!attendanceDate) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance date"
            });
        }

        // Get all submitted student IDs
        const studentIds = attendance
            .map((item) => item.studentId)
            .filter(Boolean);

        if (studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid students found"
            });
        }

        // Verify that every submitted student belongs
        // to the selected class
        const students = await Student.find({
            _id: { $in: studentIds },
            class: classId
        }).select("_id");

        const validStudentIds = new Set(
            students.map((student) => student._id.toString())
        );

        const invalidStudents = studentIds.filter(
            (studentId) => !validStudentIds.has(studentId.toString())
        );

        if (invalidStudents.length > 0) {
            return res.status(403).json({
                success: false,
                message:
                    "One or more students do not belong to the selected class"
            });
        }

        const results = [];

        for (const item of attendance) {
            const { studentId, status } = item;

            if (
                !studentId ||
                !["present", "absent"].includes(status)
            ) {
                continue;
            }

            const attendanceRecord =
                await Attendance.findOneAndUpdate(
                    {
                        student: studentId,
                        date: attendanceDate
                    },
                    {
                        student: studentId,
                        date: attendanceDate,
                        status
                    },
                    {
                        new: true,
                        upsert: true,
                        runValidators: true,
                        setDefaultsOnInsert: true
                    }
                );

            results.push(attendanceRecord);
        }

        if (results.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid attendance records found"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Attendance saved successfully",
            data: results
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET ALL ATTENDANCE - ADMIN
// =====================================================

// =====================================================
// GET ALL ATTENDANCE - ADMIN
// =====================================================

const getAttendance = async (req, res, next) => {
    try {
        const {
            date,
            classId,
            rollNumber,
            status
        } = req.query;

        const filter = {};

        // =====================================================
        // CLASS FILTER
        // =====================================================

        if (classId) {
            // Prevent invalid MongoDB ObjectId errors
            if (!mongoose.Types.ObjectId.isValid(classId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid class ID"
                });
            }

            // Find students belonging to selected class
            const students = await Student.find({
                class: classId
            }).select("_id");

            // If class has no students
            if (students.length === 0) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            const studentIds = students.map(
                (student) => student._id
            );

            filter.student = {
                $in: studentIds
            };
        }

        // =====================================================
        // ROLL NUMBER FILTER
        // =====================================================

        if (rollNumber?.trim()) {
            const studentFilter = {
                rollNumber: rollNumber.trim()
            };

            // If class is also selected,
            // make sure roll number belongs to that class
            if (classId) {
                studentFilter.class = classId;
            }

            const student = await Student.findOne(
                studentFilter
            ).select("_id");

            // No matching student
            if (!student) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            filter.student = student._id;
        }

        // =====================================================
        // STATUS FILTER
        // =====================================================

        if (status) {
            if (
                !["present", "absent"].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Status must be present or absent"
                });
            }

            filter.status = status;
        }

        // =====================================================
        // DATE FILTER
        // =====================================================

        if (date) {
            const selectedDate =
                getStartOfDay(date);

            if (!selectedDate) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date"
                });
            }

            const nextDate =
                getNextDay(selectedDate);

            filter.date = {
                $gte: selectedDate,
                $lt: nextDate
            };
        }

        // =====================================================
        // FETCH ATTENDANCE
        // =====================================================

        const attendance =
            await Attendance.find(filter)
                .populate({
                    path: "student",
                    select:
                        "fullName rollNumber email class",
                    populate: {
                        path: "class",
                        select: "name"
                    }
                })
                .sort({
                    date: -1
                });

        // =====================================================
        // RESPONSE
        // =====================================================

        return res.json({
            success: true,
            data: attendance
        });

    } catch (error) {
        next(error);
    }
};
// =====================================================
// GET STUDENT ATTENDANCE
// =====================================================

const getStudentAttendance = async (
    req,
    res,
    next
) => {
    try {
        const { studentId } = req.params;

        // =====================================================
        // STUDENT OWN-DATA SECURITY
        // =====================================================

        if (
            req.user.role === "student" &&
            req.user.id.toString() !==
                studentId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // =====================================================
        // FIND STUDENT
        // =====================================================

        const student =
            await Student.findById(
                studentId
            )
                .select(
                    "fullName rollNumber email class"
                )
                .populate(
                    "class",
                    "name"
                );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // =====================================================
        // GET ATTENDANCE
        // =====================================================

        const records =
            await Attendance.find({
                student: studentId
            })
                .populate(
                    "student",
                    "fullName rollNumber email class"
                )
                .populate({
                    path: "student",
                    populate: {
                        path: "class",
                        select: "name"
                    }
                })
                .sort({
                    date: -1
                });

        // =====================================================
        // CALCULATE STATS
        // =====================================================

        const totalDays =
            records.length;

        const presentDays =
            records.filter(
                (record) =>
                    record.status === "present"
            ).length;

        const absentDays =
            records.filter(
                (record) =>
                    record.status === "absent"
            ).length;

        const percentage =
            totalDays === 0
                ? 0
                : Number(
                    (
                        (presentDays /
                            totalDays) *
                        100
                    ).toFixed(2)
                );

        return res.json({
            success: true,
            data: {
                records,
                stats: {
                    totalDays,
                    presentDays,
                    absentDays,
                    percentage
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// UPDATE ATTENDANCE
// =====================================================

const updateAttendance = async (
    req,
    res,
    next
) => {
    try {
        const { status } = req.body;

        if (
            !["present", "absent"].includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be present or absent"
            });
        }

        const attendance =
            await Attendance.findByIdAndUpdate(
                req.params.id,
                { status },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message:
                    "Attendance record not found"
            });
        }

        return res.json({
            success: true,
            message:
                "Attendance updated successfully",
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// BUILD EXPORT DATA
// =====================================================

const getExportData = async () => {
    const records =
        await Attendance.find()
            .populate({
                path: "student",
                select:
                    "fullName rollNumber class",
                populate: {
                    path: "class",
                    select: "name"
                }
            })
            .sort({
                date: -1
            });

    const studentStats = {};

    records.forEach((record) => {
        const student = record.student;

        if (!student) {
            return;
        }

        const studentId =
            student._id.toString();

        if (!studentStats[studentId]) {
            studentStats[studentId] = {
                rollNumber:
                    student.rollNumber,

                name:
                    student.fullName,

                className:
                    student.class?.name || "",

                totalDays: 0,

                present: 0,

                absent: 0
            };
        }

        studentStats[studentId]
            .totalDays++;

        if (
            record.status === "present"
        ) {
            studentStats[studentId]
                .present++;
        } else {
            studentStats[studentId]
                .absent++;
        }
    });

    return Object.values(
        studentStats
    ).map((student) => ({
        "Roll Number":
            student.rollNumber,

        "Student Name":
            student.name,

        "Class":
            student.className,

        "Total Days":
            student.totalDays,

        "Present":
            student.present,

        "Absent":
            student.absent,

        "Attendance %":
            student.totalDays === 0
                ? 0
                : Number(
                    (
                        (student.present /
                            student.totalDays) *
                        100
                    ).toFixed(2)
                )
    }));
};

// =====================================================
// EXPORT EXCEL
// =====================================================

const exportAttendance = async (
    req,
    res,
    next
) => {
    try {
        const exportData =
            await getExportData();

        const worksheet =
            XLSX.utils.json_to_sheet(
                exportData
            );

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Attendance"
        );

        const buffer =
            XLSX.write(workbook, {
                type: "buffer",
                bookType: "xlsx"
            });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="attendix-attendance.xlsx"'
        );

        return res.send(buffer);
    } catch (error) {
        next(error);
    }
};

// =====================================================
// EXPORT CSV
// =====================================================

const exportAttendanceCSV = async (
    req,
    res,
    next
) => {
    try {
        const exportData =
            await getExportData();

        const worksheet =
            XLSX.utils.json_to_sheet(
                exportData
            );

        const csv =
            XLSX.utils.sheet_to_csv(
                worksheet
            );

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="attendix-attendance.csv"'
        );

        return res.send(csv);
    } catch (error) {
        next(error);
    }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    markAttendance,
    getAttendance,
    getStudentAttendance,
    updateAttendance,
    exportAttendance,
    exportAttendanceCSV
};