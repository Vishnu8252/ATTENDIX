import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import api from "../../services/api";

function StudentProfile() {
    const navigate = useNavigate();
    const idCardRef = useRef(null);

    const [student, setStudent] = useState(null);

    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // =====================================================
    // LOAD PROFILE
    // =====================================================

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/students/profile"
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to load profile"
                );
            }

            const profile =
                response.data.data;

            setStudent(profile);

            if (profile.photo) {
                setPhotoPreview(
                    profile.photo
                );
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load profile"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // =====================================================
    // SELECT PHOTO
    // =====================================================

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

    // =====================================================
    // UPLOAD PHOTO
    // =====================================================

    const handleUploadPhoto = async () => {
        if (!photo) {
            setError(
                "Please select a photo first."
            );
            return;
        }

        try {
            setUploading(true);
            setError("");
            setMessage("");

            const formData = new FormData();

            formData.append(
                "photo",
                photo
            );

            const response = await api.post(
                "/students/profile/photo",
                formData
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to upload photo"
                );
            }

            const uploadedPhoto =
                response.data.data.photo;

            setStudent((previous) => ({
                ...previous,
                photo: uploadedPhoto
            }));

            setPhotoPreview(
                uploadedPhoto
            );

            setPhoto(null);

            setMessage(
                "Profile photo updated successfully!"
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to upload photo"
            );
        } finally {
            setUploading(false);
        }
    };

    // =====================================================
    // DOWNLOAD ID CARD
    // =====================================================

    const downloadIdCard = async () => {
        if (!idCardRef.current || !student) {
            return;
        }

        try {
            setDownloading(true);
            setError("");

            const canvas =
                await html2canvas(
                    idCardRef.current,
                    {
                        scale: 3,
                        useCORS: true,
                        backgroundColor:
                            "#ffffff"
                    }
                );

            const imageData =
                canvas.toDataURL(
                    "image/png"
                );

            const pdf =
                new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                });

            const pageWidth =
                pdf.internal.pageSize.getWidth();

            const pageHeight =
                pdf.internal.pageSize.getHeight();

            const cardWidth = 90;

            const cardHeight =
                (canvas.height /
                    canvas.width) *
                cardWidth;

            const x =
                (pageWidth -
                    cardWidth) /
                2;

            const y =
                (pageHeight -
                    cardHeight) /
                2;

            pdf.addImage(
                imageData,
                "PNG",
                x,
                y,
                cardWidth,
                cardHeight
            );

            pdf.save(
                `ATTENDIX-ID-${student.rollNumber}.pdf`
            );
        } catch (error) {
            console.error(
                "ID Card Download Error:",
                error
            );

            setError(
                "Unable to download ID card. Please try again."
            );
        } finally {
            setDownloading(false);
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
                        Loading profile...
                    </h2>
                </div>
            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (!student) {
        return (
            <div className="admin-dashboard">
                <div className="error-state">

                    <h2>
                        {error ||
                            "Profile not found"}
                    </h2>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/student/dashboard"
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

            {/* =================================================
                HEADER
            ================================================= */}

            <button
                type="button"
                className="back-button"
                onClick={() =>
                    navigate(
                        "/student/dashboard"
                    )
                }
            >
                ← Back to Dashboard
            </button>

            <div className="class-details-header">

                <div>
                    <h1>
                        My Profile
                    </h1>

                    <p>
                        Personal and academic information
                    </p>
                </div>

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
                PROFILE SECTION
            ================================================= */}

            <div className="student-profile-layout">

                {/* ================================
                    PHOTO CARD
                ================================= */}

                <div className="student-profile-photo-card">

                    <div className="student-profile-photo">

                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt={
                                    student.fullName
                                }
                            />
                        ) : (
                            <div className="student-profile-photo-placeholder">
                                <span>
                                    {student.fullName
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "S"}
                                </span>
                            </div>
                        )}

                    </div>

                    <h2>
                        {student.fullName}
                    </h2>

                    <p>
                        Student
                    </p>

                    <label
                        htmlFor="profilePhoto"
                        className="profile-upload-button"
                    >
                        {photo
                            ? "Change Selected Photo"
                            : "Choose Photo"}
                    </label>

                    <input
                        id="profilePhoto"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                            handlePhotoChange
                        }
                        hidden
                    />

                    {photo && (
                        <button
                            type="button"
                            className="profile-save-photo"
                            onClick={
                                handleUploadPhoto
                            }
                            disabled={
                                uploading
                            }
                        >
                            {uploading
                                ? "Uploading..."
                                : "Upload Photo"}
                        </button>
                    )}

                    <small>
                        JPG, PNG or WEBP · Max 5 MB
                    </small>

                </div>

                {/* ================================
                    INFORMATION CARD
                ================================= */}

                <div className="student-profile-info-card">

                    <div className="profile-info-header">
                        <div>
                            <span>
                                STUDENT INFORMATION
                            </span>

                            <h2>
                                Academic Profile
                            </h2>
                        </div>
                    </div>

                    <div className="student-info-grid">

                        <div className="student-info-item">
                            <span>
                                Full Name
                            </span>

                            <strong>
                                {student.fullName}
                            </strong>
                        </div>

                        <div className="student-info-item">
                            <span>
                                Roll Number
                            </span>

                            <strong>
                                {student.rollNumber}
                            </strong>
                        </div>

                        <div className="student-info-item">
                            <span>
                                Email
                            </span>

                            <strong>
                                {student.email}
                            </strong>
                        </div>

                        <div className="student-info-item">
                            <span>
                                Class
                            </span>

                            <strong>
                                {student.class?.name ||
                                    "N/A"}
                            </strong>
                        </div>

                        <div className="student-info-item">
                            <span>
                                Date of Birth
                            </span>

                            <strong>
                                {student.dateOfBirth
                                    ? new Date(
                                        student.dateOfBirth
                                    ).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        }
                                    )
                                    : "N/A"}
                            </strong>
                        </div>

                        <div className="student-info-item">
                            <span>
                                Role
                            </span>

                            <strong>
                                Student
                            </strong>
                        </div>

                    </div>

                    <div className="profile-actions">

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

                    </div>

                </div>

            </div>

            {/* =================================================
                ID CARD
            ================================================= */}

            <section className="student-id-section">

                <div className="student-id-header">

                    <div>
                        <span>
                            DIGITAL IDENTITY
                        </span>

                        <h2>
                            Student ID Card
                        </h2>

                        <p>
                            Your official ATTENDIX student
                            identification card.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            downloadIdCard
                        }
                        disabled={
                            downloading
                        }
                    >
                        {downloading
                            ? "Preparing PDF..."
                            : "↓ Download ID Card"}
                    </button>

                </div>

                {/* =================================================
                    ID CARD
                ================================================= */}

                <div className="student-id-card-wrapper">

                    <div
                        ref={idCardRef}
                        className="student-id-card"
                    >

                        <div className="student-id-top">

                            <div>
                                <div className="student-id-brand">
                                    ATTENDIX
                                </div>

                                <div className="student-id-subtitle">
                                    SMART ATTENDANCE
                                    MANAGEMENT SYSTEM
                                </div>
                            </div>

                            <div className="student-id-badge">
                                STUDENT
                            </div>

                        </div>

                        <div className="student-id-main">

                            <div className="student-id-photo">

                                {student.photo ? (
                                    <img
                                        src={
                                            student.photo
                                        }
                                        crossOrigin="anonymous"
                                        alt={
                                            student.fullName
                                        }
                                    />
                                ) : (
                                    <div className="student-id-photo-placeholder">
                                        {student.fullName
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                            "S"}
                                    </div>
                                )}

                            </div>

                            <div className="student-id-details">

                                <h2>
                                    {student.fullName}
                                </h2>

                                <div className="student-id-detail">
                                    <span>
                                        Roll No.
                                    </span>

                                    <strong>
                                        {student.rollNumber}
                                    </strong>
                                </div>

                                <div className="student-id-detail">
                                    <span>
                                        Class
                                    </span>

                                    <strong>
                                        {student.class
                                            ?.name ||
                                            "N/A"}
                                    </strong>
                                </div>

                                <div className="student-id-detail">
                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {student.email}
                                    </strong>
                                </div>

                                <div className="student-id-detail">
                                    <span>
                                        DOB
                                    </span>

                                    <strong>
                                        {student.dateOfBirth
                                            ? new Date(
                                                student.dateOfBirth
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )
                                            : "N/A"}
                                    </strong>
                                </div>

                            </div>

                        </div>

                        <div className="student-id-footer">

                            <span>
                                This card is digitally generated
                                by ATTENDIX.
                            </span>

                            <strong>
                                ID:{" "}
                                {String(
                                    student._id
                                ).slice(-8)}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default StudentProfile;