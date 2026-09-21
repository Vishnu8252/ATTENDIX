import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";


function EditStudent() {

    const { id } = useParams();
    const navigate = useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [formData, setFormData] = useState({
        fullName: "",
        rollNumber: "",
        email: "",
        dateOfBirth: ""
    });

    const [classId, setClassId] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");


    // =====================================================
    // FETCH STUDENT
    // =====================================================

    useEffect(() => {

        let mounted = true;


        const fetchStudent = async () => {

            try {

                setError("");


                const response = await api.get(
                    `/students/${id}`
                );


                if (!response.data.success) {

                    throw new Error(
                        response.data.message ||
                        "Failed to load student"
                    );

                }


                const student =
                    response.data.data;


                if (!mounted) {
                    return;
                }


                setFormData({
                    fullName:
                        student.fullName || "",

                    rollNumber:
                        student.rollNumber || "",

                    email:
                        student.email || "",

                    dateOfBirth:
                        student.dateOfBirth
                            ? student.dateOfBirth.split("T")[0]
                            : ""
                });


                setClassId(
                    student.class?._id ||
                    student.class ||
                    ""
                );


            } catch (error) {

                if (mounted) {

                    setError(
                        error.response?.data?.message ||
                        error.message ||
                        "Failed to load student"
                    );

                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }
        };


        fetchStudent();


        return () => {
            mounted = false;
        };

    }, [id]);


    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };


    // =====================================================
    // UPDATE STUDENT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (saving) {
            return;
        }


        if (!classId) {

            setError(
                "Student class information is missing."
            );

            return;
        }


        setSaving(true);


        try {

            const response = await api.put(
                `/students/${id}`,
                {
                    fullName:
                        formData.fullName.trim(),

                    rollNumber:
                        formData.rollNumber.trim(),

                    email:
                        formData.email
                            .trim()
                            .toLowerCase(),

                    dateOfBirth:
                        formData.dateOfBirth,

                    class: classId
                }
            );


            if (!response.data.success) {

                throw new Error(
                    response.data.message ||
                    "Failed to update student"
                );

            }


            navigate(
                `/admin/classes/${classId}`,
                { replace: true }
            );


        } catch (error) {

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to update student"
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
                        Loading student...
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
                BACK BUTTON
            ================================================= */}

            <button
                type="button"
                className="back-button"
                onClick={() => {

                    if (classId) {

                        navigate(
                            `/admin/classes/${classId}`
                        );

                    } else {

                        navigate(
                            "/admin/dashboard"
                        );

                    }

                }}
                disabled={saving}
            >
                ← Back to Class
            </button>


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="form-page-header">

                <div>

                    <h1>
                        Edit Student
                    </h1>

                    <p>
                        Update student information.
                    </p>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* =================================================
                FORM
            ================================================= */}

            <div className="form-card">

                <form onSubmit={handleSubmit}>


                    {/* Full Name */}

                    <div className="form-group">

                        <label htmlFor="fullName">
                            Full Name
                        </label>

                        <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            autoComplete="name"
                            required
                        />

                    </div>


                    {/* Roll Number */}

                    <div className="form-group">

                        <label htmlFor="rollNumber">
                            Roll Number
                        </label>

                        <input
                            id="rollNumber"
                            type="text"
                            name="rollNumber"
                            value={formData.rollNumber}
                            onChange={handleChange}
                            placeholder="Enter roll number"
                            required
                        />

                    </div>


                    {/* Email */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            autoComplete="email"
                            required
                        />

                    </div>


                    {/* Date of Birth */}

                    <div className="form-group">

                        <label htmlFor="dateOfBirth">
                            Date of Birth
                        </label>

                        <input
                            id="dateOfBirth"
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* ACTIONS */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {

                                if (classId) {

                                    navigate(
                                        `/admin/classes/${classId}`
                                    );

                                } else {

                                    navigate(
                                        "/admin/dashboard"
                                    );

                                }

                            }}
                            disabled={saving}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Updating..."
                                : "Update Student"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default EditStudent;