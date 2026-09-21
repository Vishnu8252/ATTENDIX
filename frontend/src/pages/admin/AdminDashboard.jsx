import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";


function AdminDashboard() {

    const navigate = useNavigate();
    const { logout } = useAuth();


    // =====================================================
    // STATE
    // =====================================================

    const [dashboard, setDashboard] = useState({
        totalStudents: 0,
        totalClasses: 0,
        presentToday: 0,
        absentToday: 0,
        overallAttendance: 0
    });

    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // FETCH DASHBOARD DATA
    // =====================================================

    const fetchDashboard = async () => {

        try {

            setLoading(true);
            setError("");


            const [
                dashboardResponse,
                classesResponse
            ] = await Promise.all([

                api.get("/admin/dashboard"),

                api.get("/admin/classes")

            ]);


            // Dashboard statistics

            if (dashboardResponse.data.success) {

                setDashboard(
                    dashboardResponse.data.data
                );

            } else {

                throw new Error(
                    dashboardResponse.data.message ||
                    "Failed to load dashboard"
                );

            }


            // Classes

            if (classesResponse.data.success) {

                setClasses(
                    classesResponse.data.data
                );

            } else {

                throw new Error(
                    classesResponse.data.message ||
                    "Failed to load classes"
                );

            }

        } catch (error) {

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load dashboard"
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchDashboard();

    }, []);


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
    // CHART DATA
    // =====================================================

    const attendanceData = [
        {
            name: "Today",
            Present: dashboard.presentToday,
            Absent: dashboard.absentToday
        }
    ];


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
    // PAGE
    // =====================================================

    return (
        <div className="admin-dashboard">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Manage students, classes and attendance.
                    </p>

                </div>


                <div className="dashboard-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/attendance"
                            )
                        }
                    >
                        Attendance History
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/change-password"
                            )
                        }
                    >
                        Change Password
                    </button>


                    <button
                        type="button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="error-message">

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchDashboard}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="stats-grid">


                <div className="stat-card">

                    <h3>
                        Total Students
                    </h3>

                    <h2>
                        {dashboard.totalStudents}
                    </h2>

                </div>


                <div className="stat-card">

                    <h3>
                        Total Classes
                    </h3>

                    <h2>
                        {dashboard.totalClasses}
                    </h2>

                </div>


                <div className="stat-card">

                    <h3>
                        Present Today
                    </h3>

                    <h2>
                        {dashboard.presentToday}
                    </h2>

                </div>


                <div className="stat-card">

                    <h3>
                        Absent Today
                    </h3>

                    <h2>
                        {dashboard.absentToday}
                    </h2>

                </div>


                <div className="stat-card">

                    <h3>
                        Overall Attendance
                    </h3>

                    <h2>
                        {dashboard.overallAttendance}%
                    </h2>

                </div>


            </section>


            {/* =================================================
                CLASSES
            ================================================= */}

            <section className="students-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Classes
                        </h2>

                        <p>
                            Manage students by class.
                        </p>

                    </div>

                </div>


                {classes.length === 0 ? (

                    <div className="empty-state">

                        <p>
                            No classes found.
                        </p>

                    </div>

                ) : (

                    <div className="classes-grid">

                        {classes.map((item) => (

                            <div
                                className="class-card"
                                key={item._id}
                            >

                                <h3>
                                    {item.name}
                                </h3>


                                <p>
                                    {item.studentCount || 0}{" "}
                                    Students
                                </p>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/admin/classes/${item._id}`
                                        )
                                    }
                                >
                                    View Class
                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* =================================================
                ATTENDANCE ANALYTICS
            ================================================= */}

            <section className="analytics-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Attendance Analytics
                        </h2>

                        <p>
                            Today's attendance overview
                        </p>

                    </div>

                </div>


                <div className="chart-card">

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <BarChart
                            data={attendanceData}
                        >

                            <XAxis
                                dataKey="name"
                            />

                            <YAxis
                                allowDecimals={false}
                            />

                            <Tooltip />


                            <Bar
                                dataKey="Present"
                                name="Present"
                                radius={[
                                    6,
                                    6,
                                    0,
                                    0
                                ]}
                            />


                            <Bar
                                dataKey="Absent"
                                name="Absent"
                                radius={[
                                    6,
                                    6,
                                    0,
                                    0
                                ]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </section>


        </div>
    );
}


export default AdminDashboard;