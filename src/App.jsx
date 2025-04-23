import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import AddUser from "./components/AddUser";
import RecommendationForm from "./components/RecommendationForm";
import MarkingRates from "./components/MarkingRates";
import WorkloadVerification from "./components/WorkloadVerification";
import UploadDocument from "./components/UploadDocument";
import PayeeForm from "./components/PayeeForm";
import PaymentDetail from "./components/PaymentDetail";
import LecturerInfo from "./components/LecturerInfo";
import Header from "./components/Header"; // Import Header globally


function App() {
    const [role, setRole] = useState(null); // Track user role (null before login)

    // Function to handle login and set the role
    const handleLogin = (userRole) => {
        setRole(userRole); // Set the role (e.g., ROLE_ADMIN or ROLE_VISITING_LECTURER)
    };

    // Handle logout
    const handleLogout = () => {
        setRole(null); // Clear the role on logout
    };

    return (
        <Router>
            <ContentWrapper 
                role={role} 
                onLogin={handleLogin} 
                onLogout={handleLogout} 
            />
        </Router>
    );
}

const ContentWrapper = ({ role, onLogin, onLogout }) => {
    const location = useLocation(); // Get the current route location
    const isLoginPage = location.pathname === "/login"; // Check if current page is login

    return (
        <div className="App">
            {/* Render Header only if the user is not on the login page */}
            {!isLoginPage && role && <Header role={role} onLogout={onLogout} />}

            {/* Show Navbar only after the user has logged in */}
            {role && <Navbar role={role} />}

            <Routes>
                {/* Redirect to login if role is not set */}
                {!role ? (
                    <Route path="*" element={<Login onLogin={onLogin} />} />
                ) : (
                    <>
                        {/* Main Routes */}
                        <Route path="/dashboard" element={<Dashboard role={role} />} />

                        {/* Role-specific routes */}
                        {role === "ROLE_ADMIN" && (
                            <>
                                <Route path="/add-user" element={<AddUser />} />
                                <Route path="/recommendation-form" element={<RecommendationForm />} />
                                <Route path="/marking-rates" element={<MarkingRates />} />
                                <Route path="/workload-verification" element={<WorkloadVerification />} />
                                <Route path="/lecturer-info" element={<LecturerInfo />} />
                            </>
                        )}
                        {role === "ROLE_VISITING_LECTURER" && (
                           // <Route path="/upload-document" element={<UploadDocument />} />

                           <>
                                <Route path="/payee-form" element={<PayeeForm />} />
                                <Route path="/payment-detail" element={<PaymentDetail />} />
                            </>


                          
                        )}

                        {(role === "ROLE_VISITING_LECTURER" || role === "ROLE_ADMIN") && (
                            <Route path="/upload-document" element={<UploadDocument role={role} />} />
                        )}


                        {/* Redirect any other route to Dashboard */}
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </>
                )}
            </Routes>
        </div>
    );
};

export default App;

