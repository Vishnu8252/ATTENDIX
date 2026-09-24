import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

function MarkAttendance() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [classData, setClassData] = useState(null);

    const [attendance, setAttendance] = useState({});
    const [markedStudents, setMarkedStudents] = useState({});

    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [loading, setLoading] = useState(true);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // =========================
    // FETCH CLASS
    // =========================

    const fetchClass = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/admin/classes/${id}`
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to load class"
                );
            }

            setClassData(response.data.data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load class"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FETCH EXISTING ATTENDANCE
    // =========================

    const fetchAttendance = async () => {
        try {
            setAttendanceLoading(true);
            setError("");
            setMessage("");

            const response = await api.get(
                "/attendance",
                {
                    params: {
                        classId: id,
                        date
                    }
                }
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to load attendance"
                );
            }

            const records = response.data.data || [];

            const existingAttendance = {};
            const existingMarked = {};

            records.forEach((record) => {
                const studentId =
                    record.student?._id ||
                    record.student;

                if (!studentId) return;

                existingAttendance[studentId] =
                    record.status;

                existingMarked[studentId] = true;
            });

            setAttendance(existingAttendance);
            setMarkedStudents(existingMarked);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load attendance"
            );
        } finally {
            setAttendanceLoading(false);
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {
        fetchClass();
    }, [id]);

    useEffect(() => {
        if (!classData) return;

        fetchAttendance();
    }, [id, date, classData]);

    // =========================
    // MARK ONE STUDENT
    // =========================

    const markStudent = (studentId, status) => {
        setAttendance((previous) => ({
            ...previous,
            [studentId]: status
        }));

        setMarkedStudents((previous) => ({
            ...previous,
            [studentId]: true
        }));

        setError("");
        setMessage("");
    };

    // =========================
    // MARK ALL PRESENT
    // =========================

    const markAllPresent = () => {
        if (!classData) return;

        const newAttendance = {};
        const newMarked = {};

        classData.students.forEach((student) => {
            newAttendance[student._id] = "present";
            newMarked[student._id] = true;
        });

        setAttendance(newAttendance);
        setMarkedStudents(newMarked);

        setError("");
        setMessage("");
    };

    // =========================
    // MARK ALL ABSENT
    // =========================

    const markAllAbsent = () => {
        if (!classData) return;

        const newAttendance = {};
        const newMarked = {};

        classData.students.forEach((student) => {
            newAttendance[student._id] = "absent";
            newMarked[student._id] = true;
        });

        setAttendance(newAttendance);
        setMarkedStudents(newMarked);

        setError("");
        setMessage("");
    };

    // =========================
    // MARKED STUDENTS
    // =========================

    const markedStudentsList = useMemo(() => {
        if (!classData) return [];

        return classData.students.filter(
            (student) =>
                markedStudents[student._id]
        );
    }, [classData, markedStudents]);

    // =========================
    // PENDING STUDENTS
    // =========================

    const pendingStudentsList = useMemo(() => {
        if (!classData) return [];

        return classData.students.filter(
            (student) =>
                !markedStudents[student._id]
        );
    }, [classData, markedStudents]);

    // =========================
    // SAVE
    // =========================

    const handleSave = async () => {
        if (!classData) return;

        if (markedStudentsList.length === 0) {
            setError(
                "Please mark attendance for at least one student."
            );
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        const attendanceData =
            markedStudentsList.map((student) => ({
                studentId: student._id,
                status: attendance[student._id]
            }));

        try {
            const response = await api.post(
                "/attendance",
                {
                    classId: id,
                    date,
                    attendance: attendanceData
                }
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to save attendance"
                );
            }

            setMessage(
                "Attendance saved successfully!"
            );

            await fetchAttendance();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to save attendance"
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-state">
                    <h2>
                        Loading attendance...
                    </h2>
                </div>
            </div>
        );
    }

    // =========================
    // ERROR / NO CLASS
    // =========================

    if (!classData) {
        return (
            <div className="admin-dashboard">
                <div className="error-state">
                    <h2>
                        {error ||
                            "Class not found"}
                    </h2>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            {/* =========================
                HEADER
            ========================= */}

            <button
                type="button"
                className="back-button"
                onClick={() =>
                    navigate(
                        `/admin/classes/${id}`
                    )
                }
                disabled={saving}
            >
                ← Back to Class
            </button>

            <div className="class-details-header">
                <div>
                    <h1>
                        Mark Attendance
                    </h1>

                    <p>
                        {classData.class.name}
                    </p>
                </div>

                <div className="attendance-date">
                    <label htmlFor="attendanceDate">
                        Attendance Date
                    </label>

                    <input
                        id="attendanceDate"
                        type="date"
                        value={date}
                        onChange={(e) => {
                            setDate(
                                e.target.value
                            );
                            setMessage("");
                            setError("");
                        }}
                        disabled={
                            saving ||
                            attendanceLoading
                        }
                    />
                </div>
            </div>

            {/* =========================
                SUMMARY
            ========================= */}

            <div className="attendance-summary">

                <div className="attendance-summary-card">
                    <span>Total Students</span>
                    <strong>
                        {classData.students.length}
                    </strong>
                </div>

                <div className="attendance-summary-card marked">
                    <span>Marked</span>
                    <strong>
                        {markedStudentsList.length}
                    </strong>
                </div>

                <div className="attendance-summary-card pending">
                    <span>Pending</span>
                    <strong>
                        {pendingStudentsList.length}
                    </strong>
                </div>

            </div>

            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <div className="attendance-actions">

                <button
                    type="button"
                    onClick={markAllPresent}
                    disabled={
                        saving ||
                        attendanceLoading ||
                        classData.students.length === 0
                    }
                >
                    ✓ Mark All Present
                </button>

                <button
                    type="button"
                    onClick={markAllAbsent}
                    disabled={
                        saving ||
                        attendanceLoading ||
                        classData.students.length === 0
                    }
                >
                    ✕ Mark All Absent
                </button>

            </div>

            {/* =========================
                MESSAGES
            ========================= */}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {attendanceLoading ? (
                <div className="loading-state">
                    <h3>
                        Loading attendance...
                    </h3>
                </div>
            ) : (
                <>
                    {/* ==================================================
                        MARKED STUDENTS — TOP
                    ================================================== */}

                    <section className="attendance-board marked-board">

                        <div className="attendance-board-header">

                            <div>
                                <span className="attendance-board-label">
                                    COMPLETED
                                </span>

                                <h2>
                                    Marked Students
                                </h2>

                                <p>
                                    Students whose attendance
                                    has been marked
                                </p>
                            </div>

                            <div className="attendance-board-count marked-count">
                                {markedStudentsList.length}
                            </div>

                        </div>

                        {markedStudentsList.length === 0 ? (
                            <div className="attendance-empty">
                                <div className="attendance-empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    No attendance marked yet
                                </h3>

                                <p>
                                    Mark a student below and
                                    they will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="attendance-student-list">

                                {markedStudentsList.map(
                                    (student) => {

                                        const status =
                                            attendance[
                                                student._id
                                            ];

                                        return (
                                            <div
                                                className="attendance-student-row marked-row"
                                                key={student._id}
                                            >

                                                <div className="student-number">
                                                    {student.rollNumber}
                                                </div>

                                                <div className="student-info">
                                                    <strong>
                                                        {student.fullName}
                                                    </strong>

                                                    <span>
                                                        Roll No.{" "}
                                                        {student.rollNumber}
                                                    </span>
                                                </div>

                                                <div className="student-status-buttons">

                                                    <button
                                                        type="button"
                                                        className={
                                                            status ===
                                                            "present"
                                                                ? "status-btn present active"
                                                                : "status-btn present"
                                                        }
                                                        onClick={() =>
                                                            markStudent(
                                                                student._id,
                                                                "present"
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    >
                                                        Present
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={
                                                            status ===
                                                            "absent"
                                                                ? "status-btn absent active"
                                                                : "status-btn absent"
                                                        }
                                                        onClick={() =>
                                                            markStudent(
                                                                student._id,
                                                                "absent"
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    >
                                                        Absent
                                                    </button>

                                                </div>

                                                <div
                                                    className={
                                                        status ===
                                                        "present"
                                                            ? "current-status present-status"
                                                            : "current-status absent-status"
                                                    }
                                                >
                                                    {status ===
                                                    "present"
                                                        ? "✓ Present"
                                                        : "✕ Absent"}
                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}

                    </section>

                    {/* =========================
                        HORIZONTAL DIVIDER
                    ========================= */}

                    <div className="attendance-divider">

                        <div className="attendance-divider-line"></div>

                        <div className="attendance-divider-content">
                            <span>ATTENDANCE QUEUE</span>
                        </div>

                        <div className="attendance-divider-line"></div>

                    </div>

                    {/* ==================================================
                        PENDING STUDENTS — BOTTOM
                    ================================================== */}

                    <section className="attendance-board pending-board">

                        <div className="attendance-board-header">

                            <div>
                                <span className="attendance-board-label">
                                    PENDING
                                </span>

                                <h2>
                                    Students to Mark
                                </h2>

                                <p>
                                    Mark Present or Absent to
                                    move the student above
                                </p>
                            </div>

                            <div className="attendance-board-count pending-count">
                                {pendingStudentsList.length}
                            </div>

                        </div>

                        {pendingStudentsList.length === 0 ? (
                            <div className="attendance-all-done">

                                <div className="attendance-done-icon">
                                    ✓
                                </div>

                                <h3>
                                    All students marked
                                </h3>

                                <p>
                                    Attendance is complete for
                                    this class.
                                </p>

                            </div>
                        ) : (
                            <div className="attendance-student-list">

                                {pendingStudentsList.map(
                                    (student) => (

                                        <div
                                            className="attendance-student-row pending-row"
                                            key={student._id}
                                        >

                                            <div className="student-number">
                                                {student.rollNumber}
                                            </div>

                                            <div className="student-info">
                                                <strong>
                                                    {student.fullName}
                                                </strong>

                                                <span>
                                                    Roll No.{" "}
                                                    {student.rollNumber}
                                                </span>
                                            </div>

                                            <div className="pending-actions">

                                                <button
                                                    type="button"
                                                    className="mark-present-button"
                                                    onClick={() =>
                                                        markStudent(
                                                            student._id,
                                                            "present"
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    ✓ Present
                                                </button>

                                                <button
                                                    type="button"
                                                    className="mark-absent-button"
                                                    onClick={() =>
                                                        markStudent(
                                                            student._id,
                                                            "absent"
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    ✕ Absent
                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>
                        )}

                    </section>
                </>
            )}

            {/* =========================
                SAVE
            ========================= */}

            {classData.students.length > 0 && (
                <div className="attendance-save">

                    <div>
                        <strong>
                            {markedStudentsList.length}
                        </strong>{" "}
                        of{" "}
                        <strong>
                            {classData.students.length}
                        </strong>{" "}
                        students marked
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={
                            saving ||
                            attendanceLoading ||
                            markedStudentsList.length === 0
                        }
                    >
                        {saving
                            ? "Saving Attendance..."
                            : "Save Attendance"}
                    </button>

                </div>
            )}

        </div>
    );
}

export default MarkAttendance;