import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClassDetails from "./pages/admin/ClassDetails";
import AddStudent from "./pages/admin/AddStudent";
import EditStudent from "./pages/admin/EditStudent";
import MarkAttendance from "./pages/admin/MarkAttendance";
import AttendanceHistory from "./pages/admin/AttendanceHistory";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentProfile from "./pages/student/StudentProfile";

// Common Pages
import ChangePassword from "./pages/ChangePassword";

import "./App.css";


function App() {
    return (
        <BrowserRouter>
            <AuthProvider>

                <Routes>

                    {/* =================================================
                        PUBLIC ROUTES
                    ================================================= */}

                    <Route
                        path="/"
                        element={<Login />}
                    />


                    {/* =================================================
                        ADMIN ROUTES
                    ================================================= */}

                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute role="admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/classes/:id"
                        element={
                            <ProtectedRoute role="admin">
                                <ClassDetails />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/classes/:id/add-student"
                        element={
                            <ProtectedRoute role="admin">
                                <AddStudent />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/students/:id/edit"
                        element={
                            <ProtectedRoute role="admin">
                                <EditStudent />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/classes/:id/attendance"
                        element={
                            <ProtectedRoute role="admin">
                                <MarkAttendance />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/attendance"
                        element={
                            <ProtectedRoute role="admin">
                                <AttendanceHistory />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        STUDENT ROUTES
                    ================================================= */}

                    <Route
                        path="/student/dashboard"
                        element={
                            <ProtectedRoute role="student">
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/student/attendance"
                        element={
                            <ProtectedRoute role="student">
                                <StudentAttendance />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/student/profile"
                        element={
                            <ProtectedRoute role="student">
                                <StudentProfile />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        COMMON PROTECTED ROUTES
                    ================================================= */}

                    <Route
                        path="/change-password"
                        element={
                            <ProtectedRoute>
                                <ChangePassword />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                        FALLBACK
                    ================================================= */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>

            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;