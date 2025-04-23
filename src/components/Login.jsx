import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Login.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/api/auth/login", {
                username,
                password,
            });

            if (response && response.status === 200) {
                const token = response.data.token;
                const user = response.data.user;

                // Save user and token to session storage
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("user", JSON.stringify(user));

                // Save username for future use (e.g., in Dashboard)
                sessionStorage.setItem("username", user.username);

                // Extract the user's role (e.g., Admin, Visiting Lecturer, etc.)
                const role = user.roles[0].name;

                // Notify App about the login and role (to update UI based on role)
                onLogin(role);

                // Redirect to Dashboard
                navigate("/dashboard");
            } else {
                setMessage("Unauthorized");
            }
        } catch (error) {
            console.log(error);
            setMessage("Error: Unable to connect to the server.");
        }
    };

    return (
        <div className="login-content">
            <h1>Visiting Lecturer Management System</h1>
            <div className="container">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
};

export default Login;


