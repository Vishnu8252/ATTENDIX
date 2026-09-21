import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";


function AddStudent() {

    const { id } = useParams();
    const navigate = useNavigate();


    // =====================================================
    // FORM STATE
    // =====================================================

    const [formData, setFormData] = useState({
        fullName: "",
        rollNumber: "",
        email: "",
        dateOfBirth: "",
        password: ""
    });


    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // =====================================================
    // HANDLE INPUT CHANGE
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
    // CREATE STUDENT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (loading) {
            return;
        }


        setLoading(true);


        try {

            const response = await api.post(
                "/students",
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

                    password:
                        formData.password,

                    class: id
                }
            );


            if (!response.data.success) {

                throw new Error(
                    response.data.message ||
                    "Failed to create student"
                );

            }


            // Student created successfully
            navigate(
                `/admin/classes/${id}`,
                { replace: true }
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to create student"
            );

        } finally {

            setLoading(false);

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
                        `/admin/classes/${id}`
                    )
                }
            >
                ← Back to Class
            </button>


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="form-page-header">

                <div>

                    <h1>
                        Add Student
                    </h1>

                    <p>
                        Create a new student for this class.
                    </p>

                </div>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <div className="form-card">


                {/* Error */}

                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


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


                    {/* Password */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />

                    </div>


                    {/* FORM ACTIONS */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate(
                                    `/admin/classes/${id}`
                                )
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create Student"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default AddStudent;