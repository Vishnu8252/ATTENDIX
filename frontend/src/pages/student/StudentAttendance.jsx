/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function StudentAttendance() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);

    const [stats, setStats] = useState({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        percentage: 0
    });

    const [date, setDate] = useState("");
    const [status, setStatus] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAttendance = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/attendance/student/${user.id}`
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to load attendance"
                );
            }

            const data = response.data.data || {};

            setRecords(data.records || []);
            setFilteredRecords(data.records || []);

            setStats({
                totalDays: data.stats?.totalDays || 0,
                presentDays: data.stats?.presentDays || 0,
                absentDays: data.stats?.absentDays || 0,
                percentage: Number(data.stats?.percentage) || 0
            });
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

    useEffect(() => {
        if (user?.id) {
            fetchAttendance();
        }
    }, [user?.id]);

    useEffect(() => {
        let result = [...records];

        // Filter by date
        if (date) {
            result = result.filter((record) => {
                const recordDate = new Date(record.date);

                if (Number.isNaN(recordDate.getTime())) {
                    return false;
                }

                const year = recordDate.getFullYear();
                const month = String(
                    recordDate.getMonth() + 1
                ).padStart(2, "0");
                const day = String(
                    recordDate.getDate()
                ).padStart(2, "0");

                return `${year}-${month}-${day}` === date;
            });
        }

        // Filter by status
        if (status) {
            result = result.filter(
                (record) => record.status === status
            );
        }

        setFilteredRecords(result);
    }, [date, status, records]);

    const clearFilters = () => {
        setDate("");
        setStatus("");
    };

    const formatDate = (value) => {
        const recordDate = new Date(value);

        if (Number.isNaN(recordDate.getTime())) {
            return "N/A";
        }

        return recordDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-state">
                    <h2>Loading attendance...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="error-state">
                    <h2>Unable to load attendance</h2>
                    <p>{error}</p>

                    <button onClick={fetchAttendance}>
                        Try Again
                    </button>

                    <button
                        onClick={() =>
                            navigate("/student/dashboard")
                        }
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            {/* Back Button */}
            <button
                onClick={() =>
                    navigate("/student/dashboard")
                }
            >
                ← Back to Dashboard
            </button>

            {/* Header */}
            <div className="class-details-header">

                <div>
                    <h1>Attendance History</h1>

                    <p>
                        {user?.name || "Student"} —{" "}
                        {user?.class?.name || "N/A"}
                    </p>
                </div>

            </div>

            {/* Statistics */}
            <section className="stats-grid">

                <div className="stat-card">
                    <h3>Total Days</h3>
                    <strong>
                        {stats.totalDays}
                    </strong>
                </div>

                <div className="stat-card">
                    <h3>Present</h3>
                    <strong>
                        {stats.presentDays}
                    </strong>
                </div>

                <div className="stat-card">
                    <h3>Absent</h3>
                    <strong>
                        {stats.absentDays}
                    </strong>
                </div>

                <div className="stat-card">
                    <h3>Attendance</h3>
                    <strong>
                        {stats.percentage}%
                    </strong>
                </div>

            </section>

            {/* Filters */}
            <section className="attendance-filters">

                <div className="form-group">

                    <label htmlFor="attendance-date">
                        Date
                    </label>

                    <input
                        id="attendance-date"
                        type="date"
                        value={date}
                        onChange={(e) =>
                            setDate(e.target.value)
                        }
                    />

                </div>

                <div className="form-group">

                    <label htmlFor="attendance-status">
                        Status
                    </label>

                    <select
                        id="attendance-status"
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value)
                        }
                    >
                        <option value="">
                            All
                        </option>

                        <option value="present">
                            Present
                        </option>

                        <option value="absent">
                            Absent
                        </option>
                    </select>

                </div>

                <button onClick={clearFilters}>
                    Clear Filters
                </button>

            </section>

            {/* Attendance Records */}
            <section className="students-section">

                <h2>Attendance Records</h2>

                {filteredRecords.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            No attendance records found.
                        </p>
                    </div>
                ) : (
                    <div className="students-table">

                        <table>

                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredRecords.map(
                                    (record) => (
                                        <tr
                                            key={record._id}
                                        >
                                            <td>
                                                {formatDate(
                                                    record.date
                                                )}
                                            </td>

                                            <td>
                                                {record.status ===
                                                "present"
                                                    ? "Present"
                                                    : "Absent"}
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

export default StudentAttendance;