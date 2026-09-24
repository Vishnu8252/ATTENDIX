import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

function AddStudent() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [classData, setClassData] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        rollNumber: "",
        email: "",
        dateOfBirth: "",
        password: ""
    });

    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // =========================
    // LOAD CLASS
    // =========================

    useEffect(() => {
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

        fetchClass();
    }, [id]);

    // =========================
    // INPUT CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setMessage("");
    };

    // =========================
    // PHOTO CHANGE
    // =========================

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Only JPG, PNG and WEBP images are allowed."
            );

            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(
                "Photo size must be less than 5 MB."
            );

            e.target.value = "";
            return;
        }

        setPhoto(file);

        const previewUrl =
            URL.createObjectURL(file);

        setPhotoPreview(previewUrl);

        setError("");
        setMessage("");
    };

    // =========================
    // REMOVE PHOTO
    // =========================

    const removePhoto = () => {
        setPhoto(null);
        setPhotoPreview("");

        const photoInput =
            document.getElementById(
                "studentPhoto"
            );

        if (photoInput) {
            photoInput.value = "";
        }
    };

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving) {
            return;
        }

        setError("");
        setMessage("");

        if (!formData.fullName.trim()) {
            setError(
                "Student name is required."
            );
            return;
        }

        if (!formData.rollNumber.trim()) {
            setError(
                "Roll number is required."
            );
            return;
        }

        if (!formData.email.trim()) {
            setError(
                "Email is required."
            );
            return;
        }

        if (!formData.dateOfBirth) {
            setError(
                "Date of birth is required."
            );
            return;
        }

        if (!formData.password) {
            setError(
                "Password is required."
            );
            return;
        }

        try {
            setSaving(true);

            const data = new FormData();

            data.append(
                "fullName",
                formData.fullName
            );

            data.append(
                "rollNumber",
                formData.rollNumber
            );

            data.append(
                "email",
                formData.email
            );

            data.append(
                "class",
                id
            );

            data.append(
                "dateOfBirth",
                formData.dateOfBirth
            );

            data.append(
                "password",
                formData.password
            );

            // Photo is optional
            if (photo) {
                data.append(
                    "photo",
                    photo
                );
            }

            const response = await api.post(
                "/students",
                data
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to create student"
                );
            }

            setMessage(
                "Student created successfully!"
            );

            setTimeout(() => {
                navigate(
                    `/admin/classes/${id}`
                );
            }, 800);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to create student"
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
                        Loading...
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            {/* =========================
                BACK BUTTON
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

            {/* =========================
                HEADER
            ========================= */}

            <div className="class-details-header">
                <div>
                    <h1>
                        Add Student
                    </h1>

                    <p>
                        Add a new student to{" "}
                        {classData?.class?.name ||
                            "this class"}
                    </p>
                </div>
            </div>

            {/* =========================
                FORM
            ========================= */}

            <div className="form-card">

                <form
                    onSubmit={handleSubmit}
                >

                    {/* =========================
                        PHOTO
                    ========================= */}

                    <div className="student-photo-upload">

                        <div className="student-photo-preview">

                            {photoPreview ? (
                                <img
                                    src={
                                        photoPreview
                                    }
                                    alt="Student preview"
                                />
                            ) : (
                                <div className="student-photo-placeholder">
                                    <span>
                                        +
                                    </span>

                                    <small>
                                        Photo
                                    </small>
                                </div>
                            )}

                        </div>

                        <div className="student-photo-controls">

                            <h3>
                                Student Photo
                            </h3>

                            <p>
                                JPG, PNG or WEBP
                                · Maximum 5 MB
                            </p>

                            <div className="student-photo-buttons">

                                <label
                                    htmlFor="studentPhoto"
                                    className="photo-upload-button"
                                >
                                    {photo
                                        ? "Change Photo"
                                        : "Upload Photo"}
                                </label>

                                {photo && (
                                    <button
                                        type="button"
                                        className="photo-remove-button"
                                        onClick={
                                            removePhoto
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Remove
                                    </button>
                                )}

                            </div>

                            <input
                                id="studentPhoto"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={
                                    handlePhotoChange
                                }
                                hidden
                            />

                        </div>

                    </div>

                    {/* =========================
                        BASIC INFORMATION
                    ========================= */}

                    <div className="form-grid">

                        <div className="form-group">

                            <label htmlFor="fullName">
                                Full Name
                            </label>

                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="Enter student name"
                                value={
                                    formData.fullName
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="rollNumber">
                                Roll Number
                            </label>

                            <input
                                id="rollNumber"
                                name="rollNumber"
                                type="text"
                                placeholder="Enter roll number"
                                value={
                                    formData.rollNumber
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="student@example.com"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Class
                            </label>

                            <input
                                type="text"
                                value={
                                    classData?.class
                                        ?.name || ""
                                }
                                disabled
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="dateOfBirth">
                                Date of Birth
                            </label>

                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={
                                    formData.dateOfBirth
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="password">
                                Login Password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create password"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                            />

                        </div>

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

                    {/* =========================
                        ACTIONS
                    ========================= */}

                    <div className="form-actions">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/admin/classes/${id}`
                                )
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Creating Student..."
                                : "Create Student"}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default AddStudent;