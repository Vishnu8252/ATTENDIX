/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";


function StudentDashboard() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [attendance, setAttendance] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // FETCH ATTENDANCE
    // =====================================================

    const fetchAttendance = async () => {

        if (!user?.id) {
            return;
        }


        try {

            setLoading(true);
            setError("");


            const response = await api.get(
                `/attendance/student/${user.id}`
            );


            if (!response.data.success) {

                throw new Error(
                    response.data.message ||
                    "Failed to load attendance"
                );

            }


            setAttendance(
                response.data.data
            );


        } catch (error) {

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load attendance"
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // LOAD ATTENDANCE
    // =====================================================

    useEffect(() => {

        if (user?.id) {
            fetchAttendance();
        }

    }, [user?.id]);


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = async () => {

        try {

            await logout();

            navigate(
                "/",
                { replace: true }
            );

        } catch {

            setError(
                "Failed to logout. Please try again."
            );

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
                        Loading dashboard...
                    </h2>

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (
            <div className="admin-dashboard">

                <div className="error-state">

                    <h2>
                        {error}
                    </h2>


                    <button
                        type="button"
                        onClick={fetchAttendance}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    // =====================================================
    // ATTENDANCE DATA
    // =====================================================

    const stats =
        attendance?.stats || {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            percentage: 0
        };


    const records =
        attendance?.records || [];


    const percentage =
        Number(stats.percentage) || 0;


    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="admin-dashboard">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="dashboard-header">

                <div>

                    <h1>
                        ATTENDIX
                    </h1>

                    <p>
                        Welcome,{" "}
                        {user?.name || "Student"}
                    </p>

                </div>


                <div className="dashboard-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/student/profile"
                            )
                        }
                    >
                        Profile
                    </button>


                    <button
                        type="button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* =================================================
                STUDENT INFORMATION
            ================================================= */}

            <section className="student-info-section">

                <h2>
                    Student Dashboard
                </h2>

                <p>
                    Class:{" "}

                    <strong>
                        {user?.class?.name ||
                            "N/A"}
                    </strong>
                </p>

            </section>


            {/* =================================================
                LOW ATTENDANCE WARNING
            ================================================= */}

            {percentage < 75 && (

                <div className="attendance-warning">

                    <div>
                        ⚠️
                    </div>


                    <div>

                        <strong>
                            Low Attendance Warning
                        </strong>

                        <p>
                            Your attendance is below 75%.
                            Please maintain regular attendance.
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="stats-grid">


                <div className="stat-card">

                    <h3>
                        Attendance
                    </h3>

                    <strong>
                        {percentage}%
                    </strong>

                </div>


                <div className="stat-card">

                    <h3>
                        Total Days
                    </h3>

                    <strong>
                        {stats.totalDays}
                    </strong>

                </div>


                <div className="stat-card">

                    <h3>
                        Present
                    </h3>

                    <strong>
                        {stats.presentDays}
                    </strong>

                </div>


                <div className="stat-card">

                    <h3>
                        Absent
                    </h3>

                    <strong>
                        {stats.absentDays}
                    </strong>

                </div>


            </section>


            {/* =================================================
                RECENT ATTENDANCE
            ================================================= */}

            <section className="students-section">


                <div className="section-header">

                    <div>

                        <h2>
                            Recent Attendance
                        </h2>

                        <p>
                            Your latest attendance records.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/student/attendance"
                            )
                        }
                    >
                        View All
                    </button>

                </div>


                {records.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No Attendance Records
                        </h3>

                        <p>
                            Your attendance records
                            will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="students-table">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {records
                                    .slice(0, 5)
                                    .map(
                                        (record) => (

                                            <tr
                                                key={
                                                    record._id
                                                }
                                            >

                                                <td>
                                                    {record.date
                                                        ? new Date(
                                                            record.date
                                                        ).toLocaleDateString()
                                                        : "N/A"}
                                                </td>


                                                <td>
                                                    {record.status ||
                                                        "N/A"}
                                                </td>

                                            </tr>

                                        )
                                    )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


        </div>
    );
}


export default StudentDashboard;