import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function StudentProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();

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

            {/* Page Header */}
            <div className="class-details-header">
                <div>
                    <h1>My Profile</h1>
                    <p>Academic information</p>
                </div>
            </div>

            {/* Profile Information */}
            <div className="profile-card">

                <div className="profile-item">
                    <span>Full Name</span>
                    <strong>
                        {user?.name || "N/A"}
                    </strong>
                </div>

                <div className="profile-item">
                    <span>Email</span>
                    <strong>
                        {user?.email || "N/A"}
                    </strong>
                </div>

                <div className="profile-item">
                    <span>Class</span>
                    <strong>
                        {user?.class?.name || "N/A"}
                    </strong>
                </div>

            </div>

            {/* Profile Actions */}
            <div className="profile-actions">

                <button
                    type="button"
                    onClick={() =>
                        navigate("/change-password")
                    }
                >
                    Change Password
                </button>

            </div>

        </div>
    );
}

export default StudentProfile;