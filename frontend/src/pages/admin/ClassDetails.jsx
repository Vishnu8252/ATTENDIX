/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";


function ClassDetails() {

    const { id } = useParams();
    const navigate = useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [classData, setClassData] = useState(null);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");


    // =====================================================
    // FETCH CLASS
    // =====================================================

    const fetchClass = async () => {

        try {

            setLoading(true);
            setError("");


            const response = await api.get(
                `/admin/classes/${id}`
            );


            if (!response.data.success) {

                throw new Error(
                    response.data.message ||
                    "Failed to load class"
                );

            }


            setClassData(
                response.data.data
            );

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


    // =====================================================
    // LOAD CLASS WHEN ID CHANGES
    // =====================================================

    useEffect(() => {

        fetchClass();

    }, [id]);


    // =====================================================
    // DELETE STUDENT
    // =====================================================

    const handleDelete = async (studentId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this student?"
        );


        if (!confirmed) {
            return;
        }


        try {

            setDeleting(true);
            setError("");


            await api.delete(
                `/students/${studentId}`
            );


            // Refresh class data
            await fetchClass();

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to delete student"
            );

        } finally {

            setDeleting(false);

        }
    };


    // =====================================================
    // SEARCH STUDENTS
    // =====================================================

    const searchValue =
        search.trim().toLowerCase();


    const filteredStudents =
        classData?.students?.filter((student) => {

            const name =
                student.fullName
                    ?.toLowerCase() || "";

            const rollNumber =
                student.rollNumber
                    ?.toLowerCase() || "";

            const email =
                student.email
                    ?.toLowerCase() || "";


            return (
                name.includes(searchValue) ||
                rollNumber.includes(searchValue) ||
                email.includes(searchValue)
            );

        }) || [];


    // =====================================================
    // LOADING STATE
    // =====================================================

    if (loading) {

        return (
            <div className="admin-dashboard">

                <div className="loading-state">

                    <h2>
                        Loading class...
                    </h2>

                </div>

            </div>
        );
    }


    // =====================================================
    // CLASS NOT FOUND / ERROR
    // =====================================================

    if (!classData) {

        return (
            <div className="admin-dashboard">

                <div className="error-state">

                    <h2>
                        {error || "Class not found"}
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
                        "/admin/dashboard"
                    )
                }
            >
                ← Back to Dashboard
            </button>


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div className="error-message">

                    <p>
                        {error}
                    </p>

                </div>

            )}


            {/* =================================================
                CLASS HEADER
            ================================================= */}

            <div className="class-details-header">

                <div>

                    <h1>
                        {classData.class.name}
                    </h1>

                    <p>
                        Total Students:{" "}

                        <strong>
                            {classData.students.length}
                        </strong>
                    </p>

                </div>


                <div className="class-actions">

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


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/admin/classes/${id}/attendance`
                            )
                        }
                    >
                        Mark Attendance
                    </button>

                </div>

            </div>


            {/* =================================================
                STUDENTS SECTION
            ================================================= */}

            <section className="students-section">


                <div className="section-header">

                    <div>

                        <h2>
                            Students
                        </h2>

                        <p>
                            Manage students enrolled in this class.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    SEARCH
                ================================================= */}

                {classData.students.length > 0 && (

                    <div className="student-search">

                        <input
                            type="text"
                            placeholder="Search by name, roll number or email..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                )}


                {/* =================================================
                    NO STUDENTS
                ================================================= */}

                {classData.students.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No students found
                        </h3>

                        <p>
                            This class does not have any students yet.
                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/admin/classes/${id}/add-student`
                                )
                            }
                        >
                            + Add First Student
                        </button>

                    </div>


                ) : filteredStudents.length === 0 ? (


                    /* =================================================
                       NO SEARCH RESULTS
                    ================================================= */

                    <div className="empty-state">

                        <h3>
                            No students found
                        </h3>

                        <p>
                            No students match your search.
                        </p>

                    </div>


                ) : (


                    /* =================================================
                       STUDENTS TABLE
                    ================================================= */

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
                                        Email
                                    </th>

                                    <th>
                                        Date of Birth
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredStudents.map(
                                    (student) => (

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
                                                {
                                                    student.email
                                                }
                                            </td>


                                            <td>
                                                {student.dateOfBirth
                                                    ? new Date(
                                                        student.dateOfBirth
                                                    ).toLocaleDateString()
                                                    : "N/A"}
                                            </td>


                                            <td>

                                                <div className="table-actions">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/students/${student._id}/edit`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        type="button"
                                                        disabled={deleting}
                                                        onClick={() =>
                                                            handleDelete(
                                                                student._id
                                                            )
                                                        }
                                                    >
                                                        {deleting
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>

                                                </div>

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


export default ClassDetails;