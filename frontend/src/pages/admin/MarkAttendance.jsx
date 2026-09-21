/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

function MarkAttendance() {
    const { id } = useParams();
    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [classData, setClassData] = useState(null);
    const [attendance, setAttendance] = useState({});

    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // =====================================================
    // FETCH CLASS STUDENTS
    // =====================================================

    const fetchClass = async () => {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const response = await api.get(
                `/admin/classes/${id}`
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to load class"
                );
            }

            const data = response.data.data;

            setClassData(data);

            // Default every student to present
            const initialAttendance = {};

            data.students.forEach((student) => {
                initialAttendance[student._id] = "present";
            });

            setAttendance(initialAttendance);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load students"
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD CLASS
    // =====================================================

    useEffect(() => {
        fetchClass();
    }, [id]);

    // =====================================================
    // CHANGE INDIVIDUAL STATUS
    // =====================================================

    const handleStatusChange = (studentId, status) => {
        setAttendance((previousAttendance) => ({
            ...previousAttendance,
            [studentId]: status
        }));

        setMessage("");
        setError("");
    };

    // =====================================================
    // MARK ALL
    // =====================================================

    const markAll = (status) => {
        if (!classData) {
            return;
        }

        const updatedAttendance = {};

        classData.students.forEach((student) => {
            updatedAttendance[student._id] = status;
        });

        setAttendance(updatedAttendance);

        setMessage("");
        setError("");
    };

    // =====================================================
    // SAVE ATTENDANCE
    // =====================================================

    const handleSave = async () => {
        if (!classData) {
            return;
        }

        if (classData.students.length === 0) {
            setError(
                "There are no students in this class."
            );
            return;
        }

        if (!date) {
            setError(
                "Please select an attendance date."
            );
            return;
        }

        if (saving) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            // Prepare attendance payload
            const attendanceData =
                classData.students.map((student) => ({
                    studentId: student._id,
                    status:
                        attendance[student._id] ||
                        "present"
                }));

            // Send selected class ID as well.
            // Backend verifies that every student
            // belongs to this class.
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

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-state">
                    <h2>
                        Loading students...
                    </h2>
                </div>
            </div>
        );
    }

    // =====================================================
    // ERROR WITHOUT CLASS DATA
    // =====================================================

    if (!classData) {
        return (
            <div className="admin-dashboard">
                <div className="error-state">
                    <h2>
                        {error ||
                            "Failed to load class"}
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

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="admin-dashboard">

            {/* =================================================
                BACK BUTTON
            ================================================= */}

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

            {/* =================================================
                HEADER
            ================================================= */}

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
                        Date
                    </label>

                    <input
                        id="attendanceDate"
                        type="date"
                        value={date}
                        onChange={(e) => {
                            setDate(e.target.value);
                            setMessage("");
                            setError("");
                        }}
                        disabled={saving}
                    />

                </div>

            </div>

            {/* =================================================
                BULK ACTIONS
            ================================================= */}

            <div className="attendance-actions">

                <button
                    type="button"
                    onClick={() =>
                        markAll("present")
                    }
                    disabled={saving}
                >
                    Mark All Present
                </button>

                <button
                    type="button"
                    onClick={() =>
                        markAll("absent")
                    }
                    disabled={saving}
                >
                    Mark All Absent
                </button>

            </div>

            {/* =================================================
                MESSAGES
            ================================================= */}

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

            {/* =================================================
                STUDENTS
            ================================================= */}

            {classData.students.length === 0 ? (

                <div className="empty-state">

                    <h3>
                        No Students Found
                    </h3>

                    <p>
                        Add students to this class
                        before marking attendance.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/admin/classes/${id}/add-student`
                            )
                        }
                    >
                        + Add Student
                    </button>

                </div>

            ) : (

                <div className="students-table">

                    <table>

                        <thead>
                            <tr>
                                <th>
                                    Roll Number
                                </th>

                                <th>
                                    Name
                                </th>

                                <th>
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {classData.students.map(
                                (student) => {

                                    const status =
                                        attendance[
                                            student._id
                                        ] || "present";

                                    return (
                                        <tr
                                            key={
                                                student._id
                                            }
                                        >

                                            <td>
                                                {
                                                    student.rollNumber
                                                }
                                            </td>

                                            <td>
                                                {
                                                    student.fullName
                                                }
                                            </td>

                                            <td>

                                                <div className="attendance-status-actions">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                student._id,
                                                                "present"
                                                            )
                                                        }
                                                        disabled={saving}
                                                    >
                                                        Present
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                student._id,
                                                                "absent"
                                                            )
                                                        }
                                                        disabled={saving}
                                                    >
                                                        Absent
                                                    </button>

                                                    <span>
                                                        {status}
                                                    </span>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                        </tbody>

                    </table>

                </div>
            )}

            {/* =================================================
                SAVE
            ================================================= */}

            {classData.students.length > 0 && (

                <div className="attendance-save">

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Attendance"}
                    </button>

                </div>

            )}

        </div>
    );
}

export default MarkAttendance;