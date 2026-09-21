import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function ProtectedRoute({ children, role }) {

    const { user, loading } = useAuth();


    // Authentication status is still loading
    if (loading) {
        return <h2>Loading...</h2>;
    }


    // User is not logged in
    if (!user) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    // User doesn't have required role
    if (role && user.role !== role) {

        if (user.role === "admin") {
            return (
                <Navigate
                    to="/admin/dashboard"
                    replace
                />
            );
        }

        if (user.role === "student") {
            return (
                <Navigate
                    to="/student/dashboard"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    // Authorized user
    return children;
}


export default ProtectedRoute;