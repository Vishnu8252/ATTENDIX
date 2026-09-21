/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";


function AttendanceHistory() {

    const navigate = useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [records, setRecords] = useState([]);

    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [classesLoading, setClassesLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const [error, setError] = useState("");


    const [filters, setFilters] = useState({
        date: "",
        classId: "",
        rollNumber: "",
        status: ""
    });


    // =====================================================
    // FETCH CLASSES
    // =====================================================

    const fetchClasses = async () => {

        try {

            setClassesLoading(true);

            const response =
                await api.get("/admin/classes");


            if (!response.data?.success) {

                throw new Error(
                    response.data?.message ||
                    "Failed to load classes"
                );

            }


            setClasses(
                response.data.data || []
            );


        } catch (error) {

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load classes"
            );

        } finally {

            setClassesLoading(false);

        }
    };


    // =====================================================
    // FETCH ATTENDANCE
    // =====================================================

    const fetchAttendance = async (
        currentFilters = filters
    ) => {

        try {

            setLoading(true);
            setError("");


            const params = {};


            // =================================================
            // DATE FILTER
            // =================================================

            if (currentFilters.date) {

                params.date =
                    currentFilters.date;

            }


            // =================================================
            // CLASS FILTER
            // =================================================

            if (currentFilters.classId) {

                params.classId =
                    currentFilters.classId;

            }


            // =================================================
            // ROLL NUMBER FILTER
            // =================================================

            if (
                currentFilters.rollNumber?.trim()
            ) {

                params.rollNumber =
                    currentFilters.rollNumber.trim();

            }


            // =================================================
            // STATUS FILTER
            // =================================================

            if (currentFilters.status) {

                params.status =
                    currentFilters.status;

            }


            // =================================================
            // API REQUEST
            // =================================================

            const response =
                await api.get(
                    "/attendance",
                    {
                        params
                    }
                );


            if (!response.data?.success) {

                throw new Error(
                    response.data?.message ||
                    "Failed to load attendance"
                );

            }


            setRecords(
                response.data.data || []
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
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchClasses();

        fetchAttendance();

    }, []);


    // =====================================================
    // FILTER CHANGE
    // =====================================================

    const handleFilterChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFilters(
            (previousFilters) => ({
                ...previousFilters,
                [name]: value
            })
        );

    };


    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = () => {

        fetchAttendance(filters);

    };


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const handleClearFilters = () => {

        const clearedFilters = {
            date: "",
            classId: "",
            rollNumber: "",
            status: ""
        };


        setFilters(
            clearedFilters
        );


        fetchAttendance(
            clearedFilters
        );

    };


    // =====================================================
    // EXCEL EXPORT
    // =====================================================

    const handleExport = async () => {

        try {

            setExporting(true);
            setError("");


            const response =
                await api.get(
                    "/attendance/export",
                    {
                        responseType: "blob"
                    }
                );


            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    }
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;

            link.download =
                "attendix-attendance.xlsx";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            window.URL.revokeObjectURL(
                url
            );


        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to export attendance"
            );

        } finally {

            setExporting(false);

        }
    };


    // =====================================================
    // CSV EXPORT
    // =====================================================

    const handleCSVExport = async () => {

        try {

            setExporting(true);
            setError("");


            const response =
                await api.get(
                    "/attendance/export/csv",
                    {
                        responseType: "blob"
                    }
                );


            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;

            link.download =
                "attendix-attendance.csv";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            window.URL.revokeObjectURL(
                url
            );


        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to export CSV"
            );

        } finally {

            setExporting(false);

        }
    };


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
                        "/admin/dashboard"
                    )
                }
                disabled={exporting}
            >
                ← Back to Dashboard
            </button>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="class-details-header">

                <div>

                    <h1>
                        Attendance History
                    </h1>

                    <p>
                        View and manage attendance
                        records class-wise.
                    </p>

                </div>


                <div className="export-actions">

                    <button
                        type="button"
                        onClick={
                            handleExport
                        }
                        disabled={exporting}
                    >
                        {exporting
                            ? "Exporting..."
                            : "Export Excel"}
                    </button>


                    <button
                        type="button"
                        onClick={
                            handleCSVExport
                        }
                        disabled={exporting}
                    >
                        {exporting
                            ? "Exporting..."
                            : "Export CSV"}
                    </button>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="attendance-filters">


                {/* =================================================
                    DATE
                ================================================= */}

                <div className="form-group">

                    <label
                        htmlFor="attendanceDate"
                    >
                        Date
                    </label>


                    <input
                        id="attendanceDate"
                        type="date"
                        name="date"
                        value={
                            filters.date
                        }
                        onChange={
                            handleFilterChange
                        }
                    />

                </div>


                {/* =================================================
                    CLASS
                ================================================= */}

                <div className="form-group">

                    <label
                        htmlFor="classId"
                    >
                        Class
                    </label>


                    <select
                        id="classId"
                        name="classId"
                        value={
                            filters.classId
                        }
                        onChange={
                            handleFilterChange
                        }
                        disabled={
                            classesLoading
                        }
                    >

                        <option value="">
                            {classesLoading
                                ? "Loading classes..."
                                : "All Classes"}
                        </option>


                        {classes.map(
                            (schoolClass) => (

                                <option
                                    key={
                                        schoolClass._id
                                    }
                                    value={
                                        schoolClass._id
                                    }
                                >
                                    {
                                        schoolClass.name
                                    }
                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* =================================================
                    ROLL NUMBER
                ================================================= */}

                <div className="form-group">

                    <label
                        htmlFor="rollNumber"
                    >
                        Roll Number
                    </label>


                    <input
                        id="rollNumber"
                        type="text"
                        name="rollNumber"
                        placeholder="Enter roll number"
                        value={
                            filters.rollNumber
                        }
                        onChange={
                            handleFilterChange
                        }
                    />

                </div>


                {/* =================================================
                    STATUS
                ================================================= */}

                <div className="form-group">

                    <label
                        htmlFor="status"
                    >
                        Status
                    </label>


                    <select
                        id="status"
                        name="status"
                        value={
                            filters.status
                        }
                        onChange={
                            handleFilterChange
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


                {/* =================================================
                    SEARCH
                ================================================= */}

                <button
                    type="button"
                    onClick={
                        handleSearch
                    }
                    disabled={
                        loading
                    }
                >
                    Search
                </button>


                {/* =================================================
                    CLEAR
                ================================================= */}

                <button
                    type="button"
                    onClick={
                        handleClearFilters
                    }
                    disabled={
                        loading
                    }
                >
                    Clear
                </button>

            </div>


            {/* =================================================
                ACTIVE FILTER
            ================================================= */}

            {filters.classId && (

                <div className="success-message">

                    Showing attendance for:

                    {" "}

                    <strong>
                        {
                            classes.find(
                                (schoolClass) =>
                                    schoolClass._id ===
                                    filters.classId
                            )?.name ||
                            "Selected Class"
                        }
                    </strong>

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <div className="loading-state">

                    <h2>
                        Loading attendance...
                    </h2>

                </div>

            ) : records.length === 0 ? (

                /* =================================================
                   EMPTY STATE
                ================================================= */

                <div className="empty-state">

                    <h3>
                        No Attendance Records
                    </h3>

                    <p>
                        No attendance records match
                        the selected filters.
                    </p>

                </div>

            ) : (

                /* =================================================
                   ATTENDANCE TABLE
                ================================================= */

                <div className="students-table">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Date
                                </th>


                                <th>
                                    Class
                                </th>


                                <th>
                                    Roll Number
                                </th>


                                <th>
                                    Student
                                </th>


                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {records.map(
                                (record) => (

                                    <tr
                                        key={
                                            record._id
                                        }
                                    >

                                        {/* DATE */}

                                        <td>

                                            {record.date
                                                ? new Date(
                                                    record.date
                                                ).toLocaleDateString()
                                                : "N/A"}

                                        </td>


                                        {/* CLASS */}

                                        <td>

                                            {record.student
                                                ?.class
                                                ?.name ||
                                                "N/A"}

                                        </td>


                                        {/* ROLL NUMBER */}

                                        <td>

                                            {record.student
                                                ?.rollNumber ||
                                                "N/A"}

                                        </td>


                                        {/* STUDENT */}

                                        <td>

                                            {record.student
                                                ?.fullName ||
                                                "N/A"}

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    record.status ===
                                                    "present"
                                                        ? "attendance-present"
                                                        : "attendance-absent"
                                                }
                                            >

                                                {record.status
                                                    ? record.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                      record.status.slice(1)
                                                    : "N/A"}

                                            </span>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );
}


export default AttendanceHistory;
