import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ChangePassword() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const currentPassword =
            formData.currentPassword.trim();

        const newPassword =
            formData.newPassword.trim();

        const confirmPassword =
            formData.confirmPassword.trim();

        if (!currentPassword) {
            setError("Please enter your current password.");
            return;
        }

        if (!newPassword) {
            setError("Please enter a new password.");
            return;
        }

        if (newPassword.length < 6) {
            setError(
                "New password must be at least 6 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setError(
                "New password must be different from current password."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.put(
                "/change-password",
                {
                    currentPassword,
                    newPassword
                }
            );

            if (!response.data?.success) {
                setError(
                    response.data?.message ||
                    "Failed to change password"
                );
                return;
            }

            setMessage(
                "Password changed successfully!"
            );

            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to change password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard">

            {/* Back Button */}
            <button
                type="button"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className="form-container">

                <h1>Change Password</h1>

                <p>
                    Update your account password.
                </p>

                {/* Error Message */}
                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                {/* Success Message */}
                {message && (
                    <p className="success-message">
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Current Password */}
                    <div className="form-group">

                        <label htmlFor="currentPassword">
                            Current Password
                        </label>

                        <input
                            id="currentPassword"
                            type="password"
                            name="currentPassword"
                            value={
                                formData.currentPassword
                            }
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                            disabled={loading}
                        />

                    </div>

                    {/* New Password */}
                    <div className="form-group">

                        <label htmlFor="newPassword">
                            New Password
                        </label>

                        <input
                            id="newPassword"
                            type="password"
                            name="newPassword"
                            value={
                                formData.newPassword
                            }
                            onChange={handleChange}
                            autoComplete="new-password"
                            minLength={6}
                            required
                            disabled={loading}
                        />

                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">

                        <label htmlFor="confirmPassword">
                            Confirm New Password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={
                                formData.confirmPassword
                            }
                            onChange={handleChange}
                            autoComplete="new-password"
                            minLength={6}
                            required
                            disabled={loading}
                        />

                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Changing..."
                            : "Change Password"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default ChangePassword;