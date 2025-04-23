import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css"; // Include your CSS for styling

const Header = ({ role, onLogout }) => {
    const navigate = useNavigate();

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("authToken"); // Clear any authentication tokens
        onLogout(); // Call the parent callback to handle logout
        navigate("/Login");
    };

    return (
        <header className="header">
            <div className="header-left">
                <h1>Visiting Lecturer Management System</h1>
                {role && (
                    <h2>
                        Welcome, <strong>{role === "ROLE_ADMIN" ? "Admin" : "Visiting Lecturer"}</strong>
                    </h2>
                )}
            </div>
            <div className="header-buttons">
                <button onClick={() => navigate("/change-password")}>Change Password</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </header>
    );
};

export default Header;


