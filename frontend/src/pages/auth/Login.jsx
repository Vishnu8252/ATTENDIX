import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setMessage("Please enter email and password.");
            return;
        }

        setLoading(true);

        try {
            const data = await login(
                normalizedEmail,
                password
            );

            if (!data?.success) {
                setMessage(
                    data?.message ||
                    "Invalid email or password"
                );
                return;
            }

            if (data.user?.role === "admin") {
                navigate(
                    "/admin/dashboard",
                    { replace: true }
                );
            } else if (data.user?.role === "student") {
                navigate(
                    "/student/dashboard",
                    { replace: true }
                );
            } else {
                setMessage("Invalid user role.");
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-header">

                    <h1>ATTENDIX</h1>

                    <p>
                        Smart Attendance Management System
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="login-form"
                >

                    {/* Email */}
                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            autoComplete="email"
                            required
                            disabled={loading}
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
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            autoComplete="current-password"
                            required
                            disabled={loading}
                        />

                    </div>

                    {/* Error */}
                    {message && (
                        <p className="error-message">
                            {message}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;