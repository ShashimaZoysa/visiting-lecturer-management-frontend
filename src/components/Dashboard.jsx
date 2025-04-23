import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Outlet } from "react-router-dom";
import "./Dashboard.css"; // Include your CSS for styling

const Dashboard = ({ role }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch username from sessionStorage if not passed as prop
    const usernameFromSessionStorage = sessionStorage.getItem('username');
    const username = usernameFromSessionStorage;

    // Debugging: Log the username
    console.log("Using username:", username);

    // Fetch user details when component mounts
    useEffect(() => {
        if (!username) {
            setLoading(false);
            setError("No username available in session.");
            return;
        }

        const fetchUserData = async () => {
            try {
                console.log("Fetching data for user:", username); // Log the fetching action
                const response = await axiosInstance.get(`/users/${username}`);
                console.log("API Response Data:", response.data); // Log the response data
                setUser(response.data);
            } catch (err) {
                console.error("Error fetching user data:", err); // Log the error details
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [username]);

    return (
        <div className="dashboard-container">
            {/* Main Content Area */}
            <div className="main-content">
                <h2>Profile</h2> {/* Profile Heading */}

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : user ? (
                    <div className="profile-info">
                        <p><strong>Name:</strong> {user.fullName}</p>
                        <p><strong>Gender:</strong> {user.gender}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>NIC:</strong> {user.nicNumber}</p>

                        {/* Conditional rendering for role-specific fields */}
                        {role === "ROLE_VISITING_LECTURER" && (
                            <p><strong>Phone Number:</strong> {user.phoneNumber}</p>
                        )}
                    </div>
                ) : (
                    <p>No user data available.</p>
                )}

                <Outlet /> {/* Render dynamic content here based on the route */}
            </div>
        </div>
    );
};

export default Dashboard;


